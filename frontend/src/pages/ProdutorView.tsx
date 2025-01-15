import React, { useEffect, useState } from "react";
import { buyOysterToken, sellOysterToken } from "../services/api"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

function ProdutorView() {
  let valor = 0.15;
  const [isSealed, setIsSealed] = useState(false);
  const [sellAmount, setSellAmount] = useState<number>(0); 

  async function checkIsSealed(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/is-sealed');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Is contract sealed:', data.isSealed);
      setIsSealed(data.isSealed); 
    } catch (error) {
      console.error('Error checking if contract is sealed:', error);
    }
  }

  useEffect(() => {
    checkIsSealed(); 
  }, []); 

  const handleBuyTokens = async () => {
    try {
      const response = await buyOysterToken({}); 
      console.log("Tokens comprados com sucesso:", response);
      
    } catch (error) {
      console.error("Erro ao comprar tokens:", error);
      
    }
  };

  const handleSellTokens = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      const response = await sellOysterToken({ amount: sellAmount });
      console.log("Tokens vendidos com sucesso:", response);
    } catch (error) {
      console.error("Erro ao vender tokens:", error);
    }
  };

  return (
      <div className="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
        <header className="flex flex-row justify-between p-8 bg-[#bf5934] w-screen h-[90px]">
          <div className="self-center text-5xl text-[#80A2A6]">Mermaid</div>
          <div className="flex flex-row space-x-10 text-xl text-[#80A2A6]">
            <span>Voltar</span>
          </div>
        </header>
  
        <div className="text-6xl text-bold text-[#fff] mt-8">Smooth Criminal</div>
        {isSealed ? ( 
          <p className="text-xl text-green-500">Contrato Selado</p>
        ) : (
          <p className="text-xl text-red-500">Contrato Não Selado</p>
        )}
        <div className="rounded-3xl w-[60vw] h-[60vh] bg-slate-700 flex flex-row items-center justify-between p-8 space-x-8">
          <div className="w-1/2 flex flex-col items-center justify-center space-y-4 text-justify">
            <span className="text-5xl text-bold text-[#fff]">Compradores</span>
            <table className="w-full text-xl text-[#fff]">
              <thead>
                <tr>
                  <th>Carteira</th>
                  <th>Valor Pago (eth)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ca978112ca1bbdcafac231b39...</td>
                  <td>{valor}eth</td>
                </tr>
                <tr>
                  <td>fb8e20fc2e4c3f248c60c39bd65...</td>
                  <td>{valor}eth</td>
                </tr>
                <tr>
                  <td>e124adcce1fb2f88e1ea799c...</td>
                  <td>{valor}eth</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div className="w-1/2 flex flex-col items-center justify-center space-y-4 text-justify">
            <span className="text-5xl text-bold text-[#fff]">Criadores</span>
            <table className="w-full text-xl text-[#fff]">
              <thead>
                <tr>
                  <th>Atividade</th>
                  <th>Saldo (tokens)</th>
                  <th>Porcentagem de Ganhos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Atividade 1</td>
                  <td>1000</td>
                  <td>10%</td>
                </tr>
                <tr>
                  <td>Atividade 2</td>
                  <td>2000</td>
                  <td>20%</td>
                </tr>
                <tr>
                  <td>Atividade 3</td>
                  <td>3000</td>
                  <td>30%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center space-x-8 w-full px-8 mt-8">
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-2xl p-4 bg-[#bf5934] rounded-full text-[#fff]">
              Vender Tokens
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#bf5934]">
            <DialogHeader>
              <DialogTitle>Vender OSTokens</DialogTitle>
              <DialogDescription>
                Venda seus OSTokens.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSellTokens}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4 text-white">
                  <Label htmlFor="amount" className="text-right">
                    Quantidade
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(Number(e.target.value))}
                    placeholder="Quantidade"
                    className="col-span-3 text-white outline-stone-50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  variant={"outline"}
                  size="lg"
                  className="text-white"
                >
                  Vender
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <span className="text-2xl text-[#fff]">
          <span className="font-bold">Valor Total:</span> {valor * 10}eth
        </span>
        <button
          onClick={handleBuyTokens}
          className="text-2xl p-4 bg-[#bf5934] rounded-full text-[#fff]"
        >
          Comprar e distribuir 100 tokens
        </button>
      </div>
  
        <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white">
          made by Team Leviatã
        </footer>
      </div>
    );
  }

  
 export default ProdutorView;