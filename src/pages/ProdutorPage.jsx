import { Navigate, useNavigate } from "react-router-dom";
import viewMusic1Prod from "../App";

function ProdutorPage() {

    let valorTotal = 4.4987654
    valorTotal = valorTotal.toFixed(2);

    const navigate = useNavigate();

    function changeProduct(){
        navigate("/");
    }

    function viewMusic1Prod(){
        navigate("/produtorView");
    }
    function viewMusic2Prod(){
        navigate("/produtorView2");
    }
    function viewMusic3Prod(){
        navigate("/produtorView3");
    }


  return (
    <div class="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">

        <header class="flex flex-row justify-between p-8 bg-[#bf5934] w-screen h-[90px]">
          <div class="self-center text-5xl text-[#80A2A6]"><a onClick={()=>{changeProduct()}}>Mermaid</a></div>
        </header>

        <main class="bg-[#1B2B40] h-screen w-screen space-y-28">
            <div class="flex justify-center items-center">
                <span class="text-4xl text-[#80A2A6]">Seus produtos</span>
            </div>

            <div class="flex flex-row items-center justify-evenly  ">
            
            <div class="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center justify-center shadow-md">
              <img class="rounded-t-3xl object-cover w-full h-2/3" src="scriminal.jpg" alt="Smooth Criminal" />
              <span class="text-3xl text-[#fff]">Smooth Criminal</span>
              <button onClick={() => viewMusic1Prod()} class="bg-[#BF5934] w-20 text-[#f2f2f2] rounded-3xl p-3 m-5">Ver</button>
            </div>

            <div class="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center justify-center">
              <img class="rounded-t-3xl object-cover w-full h-2/3" src="coldplay.jpg" alt="Yellow- coldplay" />
              <span class="text-3xl text-[#fff]">Yellow</span>
              <button onClick={() => viewMusic2Prod()} class="bg-[#BF5934] w-20 text-[#f2f2f2] rounded-3xl p-3 m-5">Ver</button>
            </div>

            <div class="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center  justify-center">
              <img class="rounded-t-3xl object-cover w-full h-2/3" src="luanSantana.jfif" alt="Luan Santana" />
              <span class="text-3xl text-[#fff]">Meio Termo</span>
              <button onClick={() => viewMusic3Prod()} class="bg-[#BF5934] w-20 text-[#f2f2f2] rounded-3xl p-3 m-5">Ver</button>
            </div>
            
            </div>
        <div class="flex justify-end items-center">
            <span class="text-[#80A2A6] bg-[#BF5934] rounded-lg p-6 m-6 text-2xl ">valor total: {valorTotal}eth</span> 
        </div>
        
        
        </main>
      <footer class="bg-[#00060D] w-screen text-[9px] text-white"> made by Team Leviatã</footer>
      </div>
  );
}

export default ProdutorPage;