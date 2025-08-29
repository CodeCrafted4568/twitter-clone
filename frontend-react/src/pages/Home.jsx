import { useEffect, useState } from 'react'
import api from '../services/api'
export default function Home(){
  const [tweets,setTweets]=useState([])
  const [text,setText]=useState('')
  async function load(){ const {data}=await api.get('/api/tweets/'); setTweets(data) }
  useEffect(()=>{ load() },[])
  async function postTweet(e){
    e.preventDefault()
    if(!text.trim())return
    await api.post('/api/tweets/',{content:text})
    setText(''); load()
  }
  return (
    <div style={{maxWidth:680,margin:'40px auto',padding:16}}>
      <form onSubmit={postTweet} style={{display:'grid',gap:8}}>
        <textarea rows={3} maxLength={280} placeholder="O que está acontecendo?" value={text} onChange={e=>setText(e.target.value)} />
        <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn btn-primary">Tweetar</button></div>
      </form>
      <div style={{height:24}} />
      <ul style={{listStyle:'none',padding:0,margin:0,display:'grid',gap:12}}>
        {tweets.map(t=>(
          <li key={t.id} style={{border:'1px solid #e1e8ed',borderRadius:16,padding:12}}>
            <div style={{fontWeight:700}}>@{t.user.username}</div>
            <div style={{whiteSpace:'pre-wrap'}}>{t.content}</div>
            <div className="muted">{new Date(t.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
