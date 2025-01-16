import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"

function ProdutorPage() {

    let valorTotal = 4.4987654
    valorTotal = parseFloat(valorTotal.toFixed(2));

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
    function viewCriarMusic(){
        navigate("/CriarMusicPage");
    }


  return (
    <div className="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">

        <header className="flex flex-row justify-between p-8 bg-[#bf5934] w-screen h-[90px]">
          <div className="self-center text-5xl text-[#80A2A6]"><a onClick={()=>{changeProduct()}}>Mermaid</a></div>
        </header>

        <main className="bg-[#1B2B40] h-screen w-screen space-y-28">
            <div className="flex flex-col justify-center items-center space-y-5">
                <span className="text-4xl text-[#80A2A6]">Seus produtos</span>
              <Button variant="default" size='lg' onClick={viewCriarMusic} className="bg-[#bf5934] hover:bg-[#db683d] rounded-full text-[#fff] font-semibold" >Adicionar</Button>

            </div>

            <div className="flex flex-row items-center justify-evenly  ">
            
            <div className="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center justify-center shadow-md">
              <img className="rounded-t-3xl object-cover w-full h-2/3" src="scriminal.png" alt="Smooth Criminal" />
              <span className="text-3xl text-[#fff]">Smooth Criminal</span>
              <button onClick={() => viewMusic1Prod()} className="bg-[#BF5934] w-20 text-[#f2f2f2] rounded-3xl p-3 m-5">Ver</button>
            </div>

            <div className="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center justify-center">
              <img className="rounded-t-3xl object-cover w-full h-2/3" src="coldplay.png" alt="Yellow- coldplay" />
              <span className="text-3xl text-[#fff]">Yellow</span>
              <button onClick={() => viewMusic2Prod()} className="bg-[#BF5934] w-20 text-[#f2f2f2] rounded-3xl p-3 m-5">Ver</button>
            </div>

            <div className="rounded-3xl w-80 h-96 bg-slate-700 flex flex-col items-center  justify-center">
              <img className="rounded-t-3xl object-cover w-full h-2/3" src="luanSantana.png" alt="Luan Santana" />
              <span className="text-3xl text-[#fff]">Meio Termo</span>
              <button onClick={() => viewMusic3Prod()} className="bg-[#BF5934] w-20 text-[#f2f2f2] rounded-3xl p-3 m-5">Ver</button>
            </div>
            
            </div>
        <div className="flex justify-end items-center">
            <span className="text-[#80A2A6] bg-[#BF5934] rounded-lg p-6 m-6 text-2xl ">valor total: {valorTotal}eth</span> 
        </div>
        
        
        </main>
      <footer className="bg-[#00060D] w-screen text-[9px] text-white"> made by Team Leviatã</footer>
      </div>
  );
}

export default ProdutorPage;