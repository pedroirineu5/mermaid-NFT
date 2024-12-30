import { useNavigate } from "react-router-dom";

function MusicPage3() {
  return (
    <>

      <div class="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
        <header class="flex flex-row justify-between p-8 bg-[#00060D] w-screen h-[90px]">
            <div class="self-center text-5xl text-[#80A2A6]">Mermaid</div>
            <div class="flex flex-row space-x-10 text-xl text-[#80A2A6]">
              <span>Voltar</span>
            </div>
        </header>

          <div class="rounded-3xl w-[60vw] h-[60vh] bg-slate-700 flex flex-row items justify-between">
              <img class=" rounded-l-3xl basis-1/2"src="scriminal.jpg" alt="Smooth Criminal" />

              <div class="basis-1/2 flex flex-col items-center justify-center space-y-4">
                <span class="text-5xl text-bold text-[#fff]">Meio termo</span>
                <span class="text-xl text-[#fff]"><span class="font-extrabold">Artista:</span> Luan Santana</span>
                <span class="text-xl text-[#fff]"><span class="font-extrabold">Produtores:</span> Bia Frazzo e cia.</span>
                <span class="text-xl text-[#fff]"><span class="font-extrabold">Gravadora:</span> Sony Music Entertainment Brasil </span>
              </div>
          </div>

          <span class="text-2xl text-[#80A2A6]">Comprar</span>
          <button class="bg-[#BF5934] text-[#f2f2f2] text-xl rounded-3xl p-6">0.15ETH</button>
        
        <footer class="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
      </div>
    </>
  );
}

export default MusicPage3; 