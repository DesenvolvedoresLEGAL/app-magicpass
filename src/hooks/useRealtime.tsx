import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeStats {
  totalParticipants: number;
  checkedInCount: number;
  recentCheckins: any[];
  liveActivity: any[];
}

export function useRealtime(eventId?: string, organizationId?: string) {
  const [stats, setStats] = useState<RealtimeStats>({
    totalParticipants: 0,
    checkedInCount: 0,
    recentCheckins: [],
    liveActivity: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!eventId && !organizationId) return;

    // Subscribe to participant changes
    const participantChannel = supabase
      .channel('participant-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          ...(eventId && { filter: `event_id=eq.${eventId}` })
        },
        (payload) => {
          console.log('Participant change:', payload);
          handleParticipantChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'participants',
          ...(eventId && { filter: `event_id=eq.${eventId}` })
        },
        (payload) => {
          // Check if this is a check-in event
          if (payload.new.checked_in_at && !payload.old.checked_in_at) {
            handleNewCheckin(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Tempo Real Ativo",
            description: "Conectado ao sistema de monitoramento em tempo real",
          });
        }
      });

    // Load initial data
    loadInitialData();

    return () => {
      supabase.removeChannel(participantChannel);
      setIsConnected(false);
    };
  }, [eventId, organizationId]);

  const handleParticipantChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setStats(prev => {
      const updated = { ...prev };
      
      switch (eventType) {
        case 'INSERT':
          updated.totalParticipants += 1;
          updated.liveActivity = [
            {
              id: newRecord.id,
              type: 'registration',
              participant: newRecord,
              timestamp: new Date().toISOString()
            },
            ...updated.liveActivity.slice(0, 19)
          ];
          break;
          
        case 'UPDATE':
          if (newRecord.checked_in_at && !oldRecord.checked_in_at) {
            updated.checkedInCount += 1;
          }
          break;
          
        case 'DELETE':
          updated.totalParticipants = Math.max(0, updated.totalParticipants - 1);
          if (oldRecord.checked_in_at) {
            updated.checkedInCount = Math.max(0, updated.checkedInCount - 1);
          }
          break;
      }
      
      return updated;
    });
  };

  const handleNewCheckin = (participant: any) => {
    // Show real-time notification
    toast({
      title: "Novo Check-in",
      description: `${participant.name} acabou de fazer check-in`,
    });

    // Add to recent checkins
    setStats(prev => ({
      ...prev,
      recentCheckins: [
        {
          id: participant.id,
          nome: participant.name,
          hora: new Date().toLocaleTimeString('pt-BR'),
          metodo: 'QR Code'
        },
        ...prev.recentCheckins.slice(0, 9)
      ],
      liveActivity: [
        {
          id: participant.id,
          type: 'checkin',
          participant,
          timestamp: new Date().toISOString()
        },
        ...prev.liveActivity.slice(0, 19)
      ]
    }));

    // Play notification sound
    playNotificationSound();
  };

  const loadInitialData = async () => {
    try {
      let participants: any[] = [];
      
      if (eventId) {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('event_id', eventId);
        
        if (error) throw error;
        participants = data || [];
      } else if (organizationId) {
        // First get events for the organization
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id')
          .eq('organization_id', organizationId);
        
        if (eventsError) throw eventsError;
        
        if (events && events.length > 0) {
          const eventIds = events.map(e => e.id);
          const { data, error } = await supabase
            .from('participants')
            .select('*')
            .in('event_id', eventIds);
          
          if (error) throw error;
          participants = data || [];
        }
      }

      const checkedIn = participants?.filter(p => p.checked_in_at) || [];
      const recentCheckins = checkedIn
        .sort((a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime())
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          nome: p.name,
          hora: new Date(p.checked_in_at).toLocaleTimeString('pt-BR'),
          metodo: 'QR Code'
        }));

      setStats({
        totalParticipants: participants?.length || 0,
        checkedInCount: checkedIn.length,
        recentCheckins,
        liveActivity: []
      });

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados iniciais",
        variant: "destructive",
      });
    }
  };

  const playNotificationSound = () => {
    try {
      // Create a simple notification beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  return {
    stats,
    isConnected,
    loadInitialData
  };
}