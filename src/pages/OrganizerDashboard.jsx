import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function OrganizerDashboard() {
 const [session,setSession] = useState(null)
 const [email,setEmail] = useState('')
 const [password,setPassword] = useState('')
 const [rows,setRows] = useState([])
 const [message,setMessage] = useState('')
 const [filter,setFilter] = useState('all')
 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>setSession(data.session))
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s))
  return ()=>subscription.unsubscribe()
 },[])
 useEffect(()=>{if(!session){setRows([]);return} load()},[session])
 async function load(){const {data,error}=await supabase.from('festival_applications').select('*').order('created_at',{ascending:false});setRows(data||[]);setMessage(error?'Access denied. Ask an administrator to authorize your account.':'')}
 async function login(e){e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email,password});setMessage(error?'Sign-in failed. Check your credentials.':'');setPassword('')}
 async function update(id,status){const {error}=await supabase.from('festival_applications').update({status}).eq('id',id);if(error)setMessage('Could not update this application.');else load()}
 if(!session)return <div className="mx-auto max-w-lg px-4 py-16"><h1 className="h-section">Organizer sign in</h1><p className="mt-2">Authorized festival organizers only.</p><form onSubmit={login} className="card mt-6 grid gap-4"><label>Email<input className="block w-full rounded-lg border p-3" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input className="block w-full rounded-lg border p-3" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn-primary" type="submit">Sign in</button>{message&&<p role="alert">{message}</p>}</form></div>
 return <div className="mx-auto max-w-6xl px-4 py-10"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="h-section">Organizer dashboard</h1><button className="btn-primary" onClick={()=>supabase.auth.signOut()}>Sign out</button></div><p className="mt-2">Applications received: {rows.length}</p>
 <label className="mt-5 block">Application type <select className="ml-2 rounded-lg border p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All</option><option value="vendor">Vendors</option><option value="sponsor">Sponsors</option><option value="volunteer">Volunteers</option></select></label>
 {message&&<p role="alert" className="mt-4 text-red-dark">{message}</p>}
 <div className="mt-6 grid gap-4">{rows.filter(r=>filter==='all'||r.application_type===filter).map(r=><article key={r.id} className="card"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold text-red-dark">{r.applicant_name} · {r.application_type}</h2><time className="text-sm">{new Date(r.created_at).toLocaleString()}</time></div><p><a className="underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone?' · '+r.phone:''}</p><p>{r.organization}</p><p>{r.category}</p><p className="whitespace-pre-wrap">{r.details}</p><label className="mt-3 block">Status <select className="ml-2 rounded-lg border p-2" value={r.status} onChange={e=>update(r.id,e.target.value)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="approved">Approved</option><option value="declined">Declined</option></select></label></article>)}</div></div>
}
