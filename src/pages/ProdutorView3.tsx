function ProdutorView3() {

    let valor = 0.15

    return (
      <div className="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
      <header className="flex flex-row justify-between p-8 bg-[#bf5934] w-screen h-[90px]">
          <div className="self-center text-5xl text-[#80A2A6]">Mermaid</div>
          <div className="flex flex-row space-x-10 text-xl text-[#80A2A6]">
            <span>Voltar</span>
          </div>
      </header>
  
        <div className="rounded-3xl w-[60vw] h-[60vh] bg-slate-700 flex flex-row items justify-between">
            <img className=" rounded-l-3xl basis-1/2"src="luanSantana.jfif" alt="Smooth Criminal" />
  
            <div className="basis-1/2 flex flex-col items-center justify-center space-y-4 text-justify">
                <span className="text-6xl text-bold text-[#fff]">Meio Termo</span>
                <span className="text-5xl text-bold text-[#fff]">Compradores</span>
                <span className="text-xl text-[#fff] text">ca978112ca1bbdcafac231b39...</span>
                <span className="text-xl text-[#fff]">fb8e20fc2e4c3f248c60c39bd65...</span>
                <span className="text-xl text-[#fff]">e124adcce1fb2f88e1ea799c...</span>
                <span className="text-xl text-[#fff] text">ca978112ca1bbdcafac231b39...</span>
                <span className="text-xl text-[#fff]">fb8e20fc2e4c3f248c60c39bd65...</span>
                <span className="text-xl text-[#fff]">e124adcce1fb2f88e1ea799c...</span>
                <span className='text-2xl p-8 bg-[#bf5934] rounded-full text-[#fff]'><span className="font-bold">Valor Total:</span> {valor*14}eth</span>
            </div>

        </div>
  
      
      <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
    </div>
    );
  }
  
  export default ProdutorView3;