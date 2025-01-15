import {assignRights, getRemainingRights, withdrawRights, sealMusicContract} from '../services/api';
import {AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
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
import { useEffect } from "react";
import { useState } from "react";
  

function CriarMusicPage(){

    const [direitos, setDireitos] = useState<{ carteira: string, porcentagem: string, atividade: string }[]>([]);
    const [remainingRights, setRemainingRights] = useState<string>("");
    const [isContractSealed, setIsContractSealed] = useState(false)

    const handleAdicionarDireitos = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const carteira = formData.get("carteira") as string;
        const porcentagem = formData.get("porcentagem") as string;
        const atividade = formData.get("atividade") as string;
    
        try {
          const response = await assignRights({
            addressRight: carteira,
            percentageOfRights: Number(porcentagem),
          });
    
          setDireitos([
            ...direitos,
            { carteira, porcentagem, atividade },
          ]);
    
          console.log("Direitos adicionados com sucesso:", response);
    
          event.currentTarget.reset();
    
        } catch (error) {
          console.error("Erro ao adicionar direitos:", error);
        }
      };


      useEffect(() => {
        const fetchData = async () => {
          try {
            const remainingRightsData = await getRemainingRights();
            setRemainingRights(remainingRightsData.remainingRights);
    
          } catch (error) {
            console.error("Erro ao buscar dados:", error);
          }
        };
    
        fetchData();
      }, []); 

      const handleRemoverDireitos = async (
        event: React.FormEvent<HTMLFormElement>
      ) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const carteira = formData.get("carteira") as string;
        const porcentagem = formData.get("Porcentagem") as string; 
    
        try {
          const response = await withdrawRights({
            addressRight: carteira,
            percentageOfRights: Number(porcentagem),
          });
    
          setDireitos(
            direitos.filter((direito) => direito.carteira !== carteira)
          );
    
          console.log("Direitos removidos com sucesso:", response);

          event.currentTarget.reset();
        } catch (error) {
          console.error("Erro ao remover direitos:", error);
        }
      };

      const handleSealContract = async () => {
        try {
          const response = await sealMusicContract({});
          console.log(response.message);
          setIsContractSealed(true);
        } 
        catch (error) {
          console.error("Erro ao selar o contrato:", error);
         
        }
      };
    

    return (
        <>
        <div className="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
      <header className="flex flex-row justify-between p-8 bg-[#bf5934] w-screen h-[90px]">
          <div className="self-center text-5xl text-[#80A2A6]">Mermaid</div>
          <div className="flex flex-row space-x-10 text-xl text-[#80A2A6]">
            <span>Voltar</span>
          </div>
      </header>


        <h1 className="text-white text-6xl font-bold"> Criar Direitos</h1>
        <div className="rounded-3xl w-[60vw] h-[60vh] bg-slate-700 flex flex-col items justify-between">
            
            <div className="flex flex-row w-full p-8 bg-red h-full ">
                <div className="flex flex-col space-y-4 p-8  justify-center ">  
                <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size='lg' className="bg-[#bf5934] text-white">Adicionar Direitos</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-[#bf5934]">
                    <DialogHeader>
                        <DialogTitle>Adicionar Direitos</DialogTitle>
                        <DialogDescription>
                            Adicione a carteira e a porcentagem de direitos que deseja adicionar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAdicionarDireitos}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="carteira" className="text-right text-white">
                                    Carteira
                                </Label>
                                <Input id="carteira" name="carteira" placeholder="0x00000" className="col-span-3 text-white outline-stone-50" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="porcentagem" className="text-right text-white">
                                    Porcentagem
                                </Label>
                                <Input id="porcentagem" name="porcentagem" placeholder="%" className="col-span-3 text-white outline-stone-50" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="atividade" className="text-right text-white">
                                    Atividade
                                </Label>
                                <Input id="atividade" name="atividade" placeholder="Sua Atividade" className="col-span-3 text-white outline-stone-50" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="outline-solid-white-50 text-white">Adicionar</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
                
                
                <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size='lg' className="bg-[#bf5934] text-white">Remover Direitos</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-[#bf5934]">
                    <DialogHeader>
                    <DialogTitle>Remover os Direitos</DialogTitle>
                    <DialogDescription>
                        Remova a carteira juntamente com a porcentagem de direitos que deseja remover.
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRemoverDireitos}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4 text-white">
                                <Label htmlFor="carteira" className="text-right">
                                    Carteira
                                </Label>
                                <Input id="carteira" name="carteira" placeholder="0x00000" className="col-span-3 text-white outline-stone-50" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 text-white">
                                <Label htmlFor="Porcentagem" className="text-right">
                                    Carteira
                                </Label>
                                <Input id="carteira" name="Porcentagem" placeholder="%" className="col-span-3 text-white outline-stone-50" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" variant={"outline"} size='lg' className="text-white">Remover</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>
                
                <AlertDialog>
                    <AlertDialogTrigger>
                        <Button
                        variant="outline"
                        size="lg"
                        className="bg-[#bf5934] text-white"
                        disabled={isContractSealed} // Desabilitar o botão se o contrato já estiver selado
                        >
                        Selar Contrato
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita depois de confirmada.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="text-white" onClick={handleSealContract}>
                                Continuar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>

                    
                </div>
                      
                <div className="mt-4 flex-grow ml-8">
                    {direitos.map((direito) => (
                        <p key={direito.carteira} className="text-white">
                        {direito.carteira}, {direito.porcentagem}, {direito.atividade}
                        </p>
                    ))}
                </div>

    
            </div>
            <div className="w-full text-center mt-4">
                <p className="text-white">
                    Direitos Restantes: {remainingRights}%
                </p>
            </div>
  
        </div>
      
      <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
    </div>
        </>
    );
}

export default CriarMusicPage;
