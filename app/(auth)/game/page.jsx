'use client'

import { useEffect } from 'react';
import { Box } from '@/components/boxes/Box';
import { Main } from '@/components/boxes/Main';
import { Loading } from '@/components/elements/Loading';
import { LobbySection } from '@/components/game/LobbySection';
import { useDataObj } from '@/hooks/useDataObj';
import { getRealtime, removeChannel } from '@/supabase/realtime';
import { useDataList } from '@/hooks/useDataList';
import { useUser } from '@/providers/UserProvider';

export default function Game(){

    const user = useUser();

    const match = useDataObj({
        table: 'matches',
        select: '*',
        filter: e => e.eq('status', 'waiting')
    });

    const players = useDataList({
        table: 'users',
        select: '*',
        filter: e => match.obj?.players?.length > 0 ? e.in('id', match.obj.players) : e.is('id', null)
    })

    useEffect(() => {
        const channel = getRealtime({ 
            name: 'matches realtime',
            table: 'matches',
            callback: match.refresh
        });
        return () => removeChannel(channel);
    }, []);

    useEffect(() => {
        players.refresh();
    }, [match.obj]);

    return (
        <Main>
            <Box $fullHeight>
                {!match.obj ? <Loading /> : <>
                    {match.obj.status == 'waiting' && <LobbySection 
                        user={user}
                        match={match.obj}
                        players={players.list}
                    />}
                </>}
            </Box>
        </Main>
    );
}