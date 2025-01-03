
function MusicPage() {
  return (
    <>

      <div className="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
        <header className="flex flex-row justify-between p-8 bg-[#00060D] w-screen h-[90px]">
          <div className="self-center text-5xl text-[#80A2A6]">Mermaid</div>
          <div className="flex flex-row space-x-10 text-xl text-[#80A2A6]">
            <span>Voltar</span>
          </div>
        </header>

        <div className="rounded-3xl w-[60vw] h-[60vh] bg-slate-700 flex flex-row items justify-between">
          <img className="rounded-l-3xl basis-1/2" src="scriminal.jpg" alt="Smooth Criminal" />

          <div className="basis-1/2 flex flex-col items-center justify-center space-y-4">
                <span className="text-5xl text-bold text-[#fff]">Yellow</span>
                <span className="text-xl text-[#fff]"><span className="font-extrabold">Autor:</span> Coldplay</span>
                <span className="text-xl text-[#fff]"><span className="font-extrabold">Produtores:</span> Will Champion/ Jon Buckland/ Guy berryman/ Chris Martin</span>
                <span className="text-xl text-[#fff]"><span className="font-extrabold">Gravadora:</span> Nettwerk</span>
          </div>
        </div>

        <div className="flex flex-row items-center space-x-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl text-[#80A2A6]">Ouvir</span>
            <button className="bg-[#BF5934] text-[#f2f2f2] text-xl rounded-3xl p-6">0.00002ETH</button>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl text-[#80A2A6]">Comprar</span>
            <button className="bg-[#BF5934] text-[#f2f2f2] text-xl rounded-3xl p-6">0.15ETH</button>
          </div>
        </div>
        <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
      </div>
      </>
  );
}

export default MusicPage; 