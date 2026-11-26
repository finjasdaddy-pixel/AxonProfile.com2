"use client";
import Link from "next/link"; import {useEffect,useState} from "react"; import {BadgeCheck,ShieldCheck,Sparkles,Gift,Heart,Star,Crown,Palette,Code,Flame,Users,Medal, Zap, Globe, Gem, Rocket} from "lucide-react";
const all=[
{name:'Verified',desc:'Identity verified by the AxonProfile team.',icon:BadgeCheck,cls:'verified'},
{name:'Content Creator',desc:'For creators sharing their work.',icon:Sparkles},
{name:'Early Supporter',desc:'You were here near the beginning.',icon:Heart},
{name:'OG Member',desc:'A founding member of the platform.',icon:Crown},
{name:'Community Helper',desc:'Recognized for helping the community.',icon:ShieldCheck},
{name:'Collector',desc:'For dedicated badge collectors.',icon:Star},
{name:'Axon Exclusive',desc:'A special platform-exclusive badge.',icon:Gift},
{name:'Custom Badge',desc:'A personal badge claimed with a custom code.',icon:Palette},
{name:'Developer',desc:'For builders and makers.',icon:Code},
{name:'Legend',desc:'A rare community recognition.',icon:Flame},
{name:'Community Star',desc:'For positive community contributions.',icon:Users},
{name:'Milestone',desc:'Celebrating a special milestone.',icon:Medal},
{name:'Power User',desc:'For active platform members.',icon:Zap},
{name:'Global Member',desc:'Part of the wider community.',icon:Globe},
{name:'Diamond',desc:'A rare collectible badge.',icon:Gem},
{name:'Launch Crew',desc:'For the early launch community.',icon:Rocket}
];
export default function Badges(){const [owned,setOwned]=useState<string[]>([]);const [equipped,setEquipped]=useState<string[]>([]);useEffect(()=>{try{setOwned(JSON.parse(localStorage.getItem('axon_badges')||'["Early Supporter"]'));setEquipped(JSON.parse(localStorage.getItem('axon_equipped')||'[]'))}catch{setOwned(['Early Supporter'])}},[]);function toggle(n:string){if(!owned.includes(n))return;const next=equipped.includes(n)?equipped.filter(x=>x!==n):[...equipped,n];setEquipped(next);localStorage.setItem('axon_equipped',JSON.stringify(next))}return <><header className="nav"><Link href="/" className="brand">axon<span>profile</span></Link><Link href="/dashboard" className="btn">Dashboard</Link></header><div className="dashboard"><aside className="sidebar"><div className="side-label">Workspace</div><Link className="side-link" href="/dashboard">Overview</Link><Link className="side-link active" href="/badges"><BadgeCheck size={17}/> My badges</Link><Link className="side-link" href="/redeem"><Gift size={17}/> Redeem badge codes</Link><Link className="side-link" href="/admin">Admin system</Link></aside><main className="main"><div className="eyebrow">Identity collection</div><h1 className="page-title" style={{marginTop:18}}>Badge collection</h1><p className="sub">Equip badges you own. Locked badges can be awarded by an authorized admin or unlocked with a code.</p><div className="notice">{owned.length} unlocked · {equipped.length} equipped</div><div className="grid2">{all.map(b=>{const Icon=b.icon;const has=owned.includes(b.name);const on=equipped.includes(b.name);return <div className="badge-card" key={b.name}><div className={'badge-art '+(b.cls||'')}><Icon size={22}/></div><div style={{minWidth:0,flex:1}}><h3>{b.name}</h3><p>{b.desc}</p><div style={{marginTop:8}}><span className="pill">{has?(on?'Equipped':'Unlocked'):'Locked'}</span></div></div><button className={'btn '+(has&&on?'primary':'')} onClick={()=>toggle(b.name)} disabled={!has}>{has?(on?'Unequip':'Equip'):'Locked'}</button></div>})}</div><p className="muted" style={{marginTop:24}}>Want a special badge? <Link href="/redeem" style={{color:'#b7a5ff'}}>Redeem a badge code →</Link></p></main></div></>}
