import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const expected = process.env.ADMIN_ACCESS_KEY;
  const supplied = request.headers.get('x-admin-key');
  if (!expected || !supplied || supplied.length !== expected.length || supplied !== expected) return NextResponse.json({error:'Unauthorized. Check the admin key and Vercel environment settings.'},{status:401});
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({error:'Database not configured. Set Supabase URL and service role key in Vercel.'},{status:503});
  const db = createClient(url, serviceKey, {auth:{autoRefreshToken:false,persistSession:false}});
  try {
    const body = await request.json();
    if (body.action === 'list') {
      const {data,error}=await db.from('bans').select('*').order('created_at',{ascending:false}).limit(200);
      if(error) throw error; return NextResponse.json({bans:data});
    }
    if (body.action === 'ban') {
      const target=String(body.target||'').trim(); const reason=String(body.reason||'').trim();
      if(!target||!reason) return NextResponse.json({error:'Target and reason are required.'},{status:400});
      let userId=target; let username:string|null=null;
      if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(target)) {
        const {data:profile,error:profileError}=await db.from('profiles').select('id,username').ilike('username',target).maybeSingle();
        if(profileError) throw profileError; if(!profile) return NextResponse.json({error:'Username not found. Use the exact username or user UUID.'},{status:404}); userId=profile.id; username=profile.username;
      } else { const {data:profile}=await db.from('profiles').select('username').eq('id',userId).maybeSingle(); username=profile?.username||null; }
      const {data,error}=await db.from('bans').insert({user_id:userId,username,reason,expires_at:body.expires_at||null,active:true}).select().single();
      if(error) throw error; return NextResponse.json({ban:data});
    }
    if (body.action === 'unban') { const {error}=await db.from('bans').update({active:false,lifted_at:new Date().toISOString()}).eq('id',body.ban_id); if(error) throw error; return NextResponse.json({ok:true}); }
    return NextResponse.json({error:'Unknown action.'},{status:400});
  } catch (e) { return NextResponse.json({error:e instanceof Error?e.message:'Database operation failed.'},{status:500}); }
}
