import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    try {
        // Attempt a harmless query to verify database connection
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const startTime = Date.now();
        const { error } = await supabase.from('system_config').select('id').limit(1);
        const latency = Date.now() - startTime;

        if (error) {
            return NextResponse.json({
                status: 'degraded',
                database: 'disconnected',
                message: error.message,
                timestamp: new Date().toISOString()
            }, { status: 503 });
        }

        return NextResponse.json({
            status: 'operational',
            database: 'connected',
            latency: `${latency}ms`,
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (err: unknown) {
        return NextResponse.json({
            status: 'down',
            database: 'unreachable',
            message: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
