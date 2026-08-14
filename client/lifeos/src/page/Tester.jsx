import React from 'react'
import { useState } from 'react'
const Tester = () => {
  const [value, setValue] = useState("")
  const [backendRes, setBackendRes] = useState("")
  async function GetData(){
    const response = await fetch("http://127.0.0.1:8000/get_dashboard_data", {
      method: "POST", 
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "user_verify": value
      })
    })
    const data = response.json();
    if (data.success){
      setBackendRes(data.data)
    }
    else{
      setBackendRes(data.message)
    }

  }
  return (
    <div>
      <input type="text" name="opinion" id="opinion" placeholder='opinion here' onSubmit={(e)=>{setValue(e.target.value)}}/>
      <button className='test-btn' onClick={GetData}>Get Data</button>
      <p>{backendRes}</p>
    </div>
  )
}

export default Tester
