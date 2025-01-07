function ProdutorView2() {

    let valor = 0.15

    return (
      <div className="w-screen h-screen bg-[#1B2B40] flex flex-col items-center justify-between ">
      <header className="flex flex-row justify-between p-8 bg-[#bf5934] w-screen h-[90px]">
          <div className="self-center text-5xl text-[#80A2A6]">Mermaid</div>
          <div className="flex flex-row space-x-10 text-xl text-[#80A2A6]">
        <span>Voltar</span>
          </div>
      </header>

      <div className="text-6xl text-bold text-[#fff] mt-8">Yellow</div>
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
          <button className="text-2xl p-4 bg-[#bf5934] rounded-full text-[#fff]">Vender Tokens</button>
          <span className='text-2xl text-[#fff]'><span className="font-bold">Valor Total:</span> {valor * 10}eth</span>
          <button className="text-2xl p-4 bg-[#bf5934] rounded-full text-[#fff]">Comprar e distribuir 100 tokens</button>
        </div>
      
      <footer className="bg-[#00060D] font-light w-screen text-[9px] text-white"> made by Team Leviatã</footer>
    </div>
    );
  }
  
  export default ProdutorView2;