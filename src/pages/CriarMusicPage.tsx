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
  

function CriarMusicPage(){
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
                        <DialogTitle>Adicionar</DialogTitle>
                        <DialogDescription>
                            Adicione a carteira e a porcentagem de direitos que deseja adicionar.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="carteira" className="text-right text-white">
                                Carteira
                                </Label>
                                <Input id="carteira" value="0x00000" className="col-span-3 text-white outline-stone-50" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="porcentagem" className="text-right text-white">
                                Porcentagem
                                </Label>
                                <Input id="porcentagem" value="%" className="col-span-3 text-white outline-stone-50" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="atividade" className="text-right text-white">
                                Atividade
                                </Label>
                                <Input id="atividade" value="Sua atividade" className="col-span-3 text-white outline-stone-50" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="outline-solid-white-50 text-white">Adicionar Direitos</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size='lg' className="bg-[#bf5934] text-white">Remover Direitos</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Remover os </DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        Name
                        </Label>
                        <Input id="name" value="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                        Username
                        </Label>
                        <Input id="username"  className="col-span-3" />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
                
                <AlertDialog >
                    <AlertDialogTrigger><Button variant='outline' size='lg' className="bg-[#bf5934] text-white">Selar Contrato</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita depois de confimada.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                    
                </div>
                <div className="flex-grow ml-8">    
                    <p className="text-white">Texto ao lado direito dos botõesTexto ao lado direito dos botõesTexto ao lado direito dos botões</p>
                    
                </div>
            </div>
  
        </div>
  
      
      <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
    </div>
        </>
    );
}

export default CriarMusicPage;