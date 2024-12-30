import { useNavigate } from 'react-router-dom';
import './App.css'

function App() {

  const navigate = useNavigate();

  function viewMusic(){
    navigate("/music");
  }

  function viewMusic2(){
    navigate("/music2");
  }

  
  function viewMusic3(){
    navigate("/music3");
  }

  function changeProduct(){
    navigate("/produtor");
  }

  return (
    <>
      <div class="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
        <header class="flex flex-row justify-between p-8 bg-[#00060D] w-screen h-[90px]">
          <div class="self-center text-5xl text-[#80A2A6]"><a onClick={()=>{changeProduct()}}>Mermaid</a></div>
          <div class="flex flex-row space-x-10 text-xl text-[#80A2A6]">
            <span>About</span>
            <span>Contact</span>
          </div>
        </header>

        <main class="bg-[#1B2B40] h-screen w-screen space-y-28">
          <div class="flex justify-center items-center">
            <span class="text-4xl text-[#80A2A6]">Coleção</span>
          </div>

          <div class="flex flex-row items-center justify-evenly">
            <div class="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center justify-center shadow-md">
              <img class="rounded-t-3xl object-cover w-full h-2/3" src="scriminal.jpg" alt="Smooth Criminal" />
              <span class="text-3xl text-[#fff]">Smooth Criminal</span>
              <button onClick={() => viewMusic()} class="bg-[#BF5934] text-[#f2f2f2] rounded-3xl p-3 m-5">0.15eth</button>
            </div>

            <div class="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center justify-center">
              <img class="rounded-t-3xl object-cover w-full h-2/3" src="coldplay.jpg" alt="Yellow- coldplay" />
              <span class="text-3xl text-[#fff]">Yellow</span>
              <button onClick={() => viewMusic2()} class="bg-[#BF5934] text-[#f2f2f2] rounded-3xl p-3 m-5">0.15eth</button>
            </div>

            <div class="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center  justify-center">
              <img class="rounded-t-3xl object-cover w-full h-2/3" src="luanSantana.jfif" alt="Luan Santana" />
              <span class="text-3xl text-[#fff]">Meio Termo</span>
              <button onClick={() => viewMusic3()} class="bg-[#BF5934] text-[#f2f2f2] rounded-3xl p-3 m-5">0.15eth</button>
            </div>
          </div>
        </main>
        <footer class="bg-[#00060D] w-screen text-[9px] text-white"> made by Team Leviatã</footer>
      </div>
    </>
  )
}

export default App
