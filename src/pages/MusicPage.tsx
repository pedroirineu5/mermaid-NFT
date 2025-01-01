
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
              <img className=" rounded-l-3xl basis-1/2"src="coldplay.jpg" alt="Yellow - Coldplay" />

              <div className="basis-1/2 flex flex-col items-center justify-center space-y-4">
                <span className="text-5xl text-bold text-[#fff]">Smooth Criminal</span>
                <span className="text-xl text-[#fff]"><span className="font-extrabold">Autor:</span> Michael Jackson</span>
                <span className="text-xl text-[#fff]"><span className="font-extrabold">Produtores:</span> Quincy Jones e Michael Jackson</span>
                <span className="text-xl text-[#fff]"><span className="font-extrabold">Gravadora:</span> Westlake Recording</span>
              </div>
          </div>

          <span className="text-2xl text-[#80A2A6]">Comprar</span>
          <button className="bg-[#BF5934] text-[#f2f2f2] text-xl rounded-3xl p-6">0.15ETH</button>
        
        <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
      </div>
      </>
  );
}

export default MusicPage; 