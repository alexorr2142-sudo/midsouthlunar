import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const types = {
 vendor: { title: 'Become a Festival Vendor', intro: 'Share your food, crafts, and culture at the Mid-South Lunar New Year Festival.', category: 'What will you sell?', options: ['Food and beverages', 'Arts and crafts', 'Cultural merchandise', 'Other'], extra: 'Booth or equipment needs', art: '🏮' },
 sponsor: { title: 'Become a Festival Sponsor', intro: 'Support a celebration of culture and community in Memphis.', category: 'Sponsorship interest', options: ['Financial sponsorship', 'In-kind donation', 'Community partnership', 'Discuss opportunities'], extra: 'Organization and sponsorship goals', art: '🧧' },
 volunteer: { title: 'Volunteer at the Festival', intro: 'Help welcome our community and make the celebration unforgettable.', category: 'Preferred role', options: ['Guest welcome', 'Event setup', 'Cultural activities', 'General assistance'], extra: 'Availability on February 5–6, 2027', art: '🎊' }
}
export default function ApplicationForm() {
 const { type } = useParams()
 const config = types[type]
 const [form, setForm] = useState({ name:'', email:'', phone:'', organization:'', category:'', details:'' })
 const [state, setState] = useState({ busy:false, message:'', success:false })
 if (!config) return <div className="mx-auto max-w-6xl px-4 py-16">Application not found. <Link to="/get-involved">Go back</Link></div>
 const set = (field,value) => setForm(prev=>({...prev,[field]:value}))
 async function submit(e) {
  e.preventDefault()
  if(state.busy) return
  setState({busy:true,message:'',success:false})
  const { error } = await supabase.from('festival_applications').insert({
   application_type:type, applicant_name:form.name.trim(), email:form.email.trim(),
   phone:form.phone.trim()||null, organization:form.organization.trim()||null,
   category:form.category, details:form.details.trim()||null
  })
  setState({busy:false,success:!error,message:error?'Your application could not be submitted. Please try again later.':'Thank you! Your application was submitted successfully.'})
  if(!error) setForm({name:'',email:'',phone:'',organization:'',category:'',details:''})
 }
 return <div className="mx-auto max-w-3xl px-4 py-10">
  <div className="rounded-3xl bg-red-dark p-8 text-white text-center">
   <div className="text-5xl" aria-hidden="true">{config.art}</div>
   <h1 className="mt-3 font-display text-3xl font-bold">{config.title}</h1><p className="mt-3 text-cream">{config.intro}</p>
  </div>
  <form onSubmit={submit} className="card mt-8 grid gap-5">
   <p className="text-sm">Fields marked * are required. Applications are reviewed by authorized festival organizers.</p>
   {[[ 'name','Full name *','text',true ],['email','Email address *','email',true],['phone','Phone number','tel',false],['organization','Business or organization','text',false]].map(([field,label,type,required])=>
    <label key={field} className="grid gap-1 font-semibold">{label}<input className="rounded-lg border border-red/30 bg-white px-4 py-3 font-normal" type={type} value={form[field]} onChange={e=>set(field,e.target.value)} required={required} maxLength={200}/></label>)}
   <label className="grid gap-1 font-semibold">{config.category} *<select className="rounded-lg border border-red/30 bg-white px-4 py-3 font-normal" value={form.category} onChange={e=>set('category',e.target.value)} required><option value="">Choose an option</option>{config.options.map(x=><option key={x}>{x}</option>)}</select></label>
   <label className="grid gap-1 font-semibold">{config.extra}<textarea className="rounded-lg border border-red/30 bg-white px-4 py-3 font-normal" rows={4} maxLength={3000} value={form.details} onChange={e=>set('details',e.target.value)} /></label>
   <button className="btn-primary justify-self-start" type="submit" disabled={state.busy}>{state.busy?'Submitting…':'Submit application'}</button>
   {state.message && <p role="status" className={state.success?'text-green-800':'text-red-dark'}>{state.message}</p>}
  </form>
 </div>
}
