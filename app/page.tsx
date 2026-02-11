"use client";
import { Calendar, DatePicker } from "@/components/DatePicker";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, scale } from "framer-motion";
import { BusFront, ChevronDown, TrainFront, TramFront } from "lucide-react";
import { eachDayOfInterval, isMonday } from "date-fns";
import { NumericFormat } from "react-number-format";
import { style } from "framer-motion/client";

const days = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];
type Day = (typeof days)[number];

const selected: Record<Day, boolean> = {
  domingo: false,
  segunda: false,
  terça: false,
  quarta: false,
  quinta: false,
  sexta: false,
  sabado: false,
};

type Feriado = {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
};

export default function Home() {
  const [inicio, setInicio] = useState<Date>();
  const [fim, setFim] = useState<Date>();
  const [passagem, setPassagem] = useState(0);
  const [valor, setValor] = useState("");
  const [diasContados, setDiasContados] = useState<number>(0);
  const [totalDias, setTotalDias] = useState<number>(0);
  const [feriadosContados, setFeriadosContados] = useState(0);
  const [preco, setPreco] = useState<number>(0);
  const [week, setWeek] = useState(selected);
  const [bus, setBus] = useState(false);
  const [train, setTrain] = useState(false);
  const [tram, setTram] = useState(false);
  const [feriados, setFeriados] = useState<Array<Feriado>>([]);

  function calcularPreco(
    passagem: number,
    valorUnitario: number,
    diasContados: number,
  ) {
    let transportes = 0;
    if (bus) transportes++;
    if (train) transportes++;
    if (tram) transportes++;

    setPreco(passagem * valorUnitario * diasContados * transportes);
  }
  function contarDiasSelecionadosSemFeriados(
    inicio: Date,
    fim: Date,
    week: Record<Day, boolean>,
    feriados: Feriado[],
  ) {
    const feriadosSet = new Set(feriados.map((f) => f.date));
    let total = 0;
    let feriadosEmTrabalho = 0;

    const dataAtual = new Date(inicio);

    while (dataAtual <= fim) {
      const dataISO = dataAtual.toISOString().split("T")[0];

      const diaIndex = dataAtual.getDay(); // 0 a 6
      const diaNome = days[diaIndex]; // "segunda", "terça", etc

      const trabalhaNesseDia = week[diaNome];
      const ehFeriado = feriadosSet.has(dataISO);

      if (trabalhaNesseDia) {
        if (ehFeriado) {
          feriadosEmTrabalho++;
        } else {
          total++;
        }
      }

      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    const umDia = 1000 * 60 * 60 * 24;

    const diff = fim.getTime() - inicio.getTime();
    setTotalDias(Math.floor(diff / umDia) + 1);
    setFeriadosContados(feriadosEmTrabalho);

    console.log("Total dias trabalhados:", total);
    console.log("Total dias trabalhados:", Math.floor(diff / umDia) + 1);
    console.log("Feriados Contados:", feriadosContados);
    setDiasContados(total);
    return total;
  }
  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await fetch(
          `https://brasilapi.com.br/api/feriados/v1/${new Date().getFullYear()}`,
        );

        if (!res.ok) {
          console.error("Erro HTTP:", res.status);
          return;
        }

        const data = await res.json();
        console.log(data);
        setFeriados(data);
      } catch (err) {
        console.error("Erro ao buscar feriados:", err);
      }
    };

    buscar();
  }, []);
  useEffect(() => {
    console.log(inicio);
  }, [inicio]);

  return (
    <>
      {/* <div className="absolute w-screen h-screen bg-[rgba(0,0,0,0.23)] backdrop-blur-[2px] z-1000 left-0 bottom-0 ">
        <div className="absolute w-screen h-screen left-0 bottom-0 "></div>
      </div> */}

      <header className="w-full min-h-18 bg-white shadow-md">
        <h1 className="font-bold text-[28px] flex items-center p-3 text-[#f0c15b]">
          Calculadora de Transporte Docente
        </h1>
      </header>

      <div className="h-full w-full flex flex-col justify-center items-center ">
        {/* -------------------------------------------- */}
        <div className=" max-h-[95%] max-w-[95%] h-175 md:flex-row flex flex-col justify-center items-center md:gap-4">
          <div className="w-110 max-h-full h-full bg-white rounded-2xl shadow-lg max-w-full flex flex-col p-5 gap-3">
            <div className="flex flex-col gap-8">
              <div className="">
                <h1 className="text-[26px] font-semibold text-[rgba(215,171,42,1)]">
                  Se planeje mais rápido!
                </h1>
                <p className="text-black">
                  Simule o pagamento de seus funcionários de forma simples e
                  descomplicada
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[rgba(26,26,26,1)] text-[19px] font-black">
                  Período escolar
                </label>
                <div className="flex justify-between">
                  <div className="">
                    <label>Início</label>
                    <DatePicker onChange={setInicio} />
                  </div>
                  <div className="">
                    <label>Fim</label>
                    <DatePicker onChange={setFim} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[rgba(26,26,26,1)] text-[19px] font-black">
                  Dias da semana
                </label>
                <div className="flex gap-1 justify-between">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <motion.button
                      key={i}
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        setWeek((prev) => ({
                          ...prev,
                          [days[i]]: !prev[days[i]],
                        }));
                        console.log(week);
                      }}
                      style={{
                        backgroundColor: week[days[i]]
                          ? "rgba(255,208,69,1)"
                          : "rgba(217,217,217,1)",
                      }}
                      className="w-10 h-10  cursor-pointer rounded-full text-black "
                    >
                      {days[i].slice(0, 1).toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[rgba(26,26,26,1)] text-[19px] font-black">
                  Selecione os transportes que se aplicam:
                </label>

                <div className=" flex gap-3">
                  <motion.button
                    initial={{ scale: 1, width: bus ? "120px" : "52px" }}
                    whileHover={{ scale: 1.02, width: "120px" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: bus
                        ? "rgba(255, 208, 69, 1)"
                        : "rgba(217,217,217,1)",
                    }}
                    onClick={() => {
                      setBus(!bus);
                    }}
                    className={`h-13 rounded-[10px] cursor-pointer flex gap-1 items-center p-3 overflow-hidden ${bus ? "w-120px" : "w-13"}`}
                  >
                    <div className="flex items-center gap-3">
                      <BusFront className="size-7" />
                      <span className="">Ônibus</span>
                    </div>
                  </motion.button>
                  <motion.button
                    initial={{ scale: 1, width: train ? "120px" : "52px" }}
                    whileHover={{ scale: 1.02, width: "120px" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: train
                        ? "rgba(255, 208, 69, 1)"
                        : "rgba(217,217,217,1)",
                    }}
                    onClick={() => {
                      setTrain(!train);
                    }}
                    className={`h-13 rounded-[10px] cursor-pointer flex gap-1 items-center p-3 overflow-hidden ${train ? "w-120px" : "w-13"}`}
                  >
                    <div className="flex items-center gap-3">
                      <TrainFront className="size-7" />
                      <span className="">Trem</span>
                    </div>
                  </motion.button>
                  <motion.button
                    initial={{ scale: 1, width: tram ? "120px" : "52px" }}
                    whileHover={{ scale: 1.02, width: "120px" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: tram
                        ? "rgba(255, 208, 69, 1)"
                        : "rgba(217,217,217,1)",
                    }}
                    onClick={() => {
                      setTram(!tram);
                    }}
                    className={`h-13 rounded-[10px] cursor-pointer flex gap-1 items-center p-3 overflow-hidden ${tram ? "w-120px" : "w-13"}`}
                  >
                    <div className="flex items-center gap-3">
                      <TramFront className="size-7" />
                      <span className="">Metrô</span>
                    </div>
                  </motion.button>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex flex-col gap-2 ">
                  <label className="text-[rgba(26,26,26,1)] text-[19px] font-black">
                    Passagens
                  </label>
                  <input
                    type="Number"
                    min={0}
                    value={passagem}
                    onChange={(e) => setPassagem(Number(e.target.value))}
                    inputMode="numeric"
                    placeholder="Quantidade"
                    className="border-gray-400 max-w-44 relative cursor-text p-2.5 h-12 gap-1 text-[16px] flex w-full rounded-[15px] border"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[rgba(26,26,26,1)] text-[19px] font-black">
                    Valor unitário
                  </label>
                  <NumericFormat
                    className="border-gray-400 max-w-44 relative cursor-text p-2.5 h-12 gap-1 text-[16px] flex w-full rounded-[15px] border"
                    value={valor}
                    prefix="R$ "
                    placeholder="R$ 0,00"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    onValueChange={(values) => {
                      const { formattedValue, value } = values;
                      setValor(formattedValue); // Valor formatado: "R$ 1.234,56"
                      console.log(valor); // Valor numérico: "1234.56"
                    }}
                  />
                </div>
              </div>

              <motion.button
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (inicio && fim) {
                    console.log(
                      calcularPreco(
                        passagem,
                        parseFloat(
                          valor.replace(/[R$ ]/g, "").replace(",", "."),
                        ),
                        contarDiasSelecionadosSemFeriados(
                          inicio,
                          fim,
                          week,
                          feriados,
                        ),
                      ),
                    );
                  }
                }}
                className="py-3 px-4 cursor-pointer rounded-2xl w-fit bg-[#f0c15b] font-semibold self-center"
              >
                Calcular
              </motion.button>
            </div>
          </div>

          <div className="w-220 max-h-full h-full flex flex-col gap-4 max-w-full">
            <div className="text-white flex flex-col justify-center items-center min-h-[22%] w-full bg-[#f0c15b] rounded-2xl shadow-lg">
              <span className="text-black font-semibold">
                Pagamento estimado{" "}
              </span>
              <h1 className="font-bold text-[35px]">
                {preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </h1>
            </div>
            <div className="bg-white rounded-2xl w-full h-full flex flex-col shadow-lg p-5 gap-5">
              <div className="">
                <div className="flex justify-between">
                  <h1 className="text-[26px] font-semibold text-[rgba(215,171,42,1)]">
                    Calendário
                  </h1>
                  <motion.button
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                    flex gap-1 cursor-pointer w-fit h-fit p-2 rounded-[10px] border border-[rgba(0,0,0,0.18)] bg-[rgba(244,244,244,1)]"
                  >
                    Rio de Janeiro, RJ
                    <ChevronDown className="text-gray-500" />
                  </motion.button>
                </div>
                <span className="text-black">Total de dias: {totalDias}</span>
                <span className="text-black mx-2">|</span>
                <span className="text-black">Trabalhados: {diasContados}</span>
                <span className="text-black mx-2">|</span>
                <span className="text-black">Feriados: {feriadosContados}</span>
              </div>

              <div className="flex gap-7 w-full h-full ">
                <div className="min-w-110 h-full flex flex-col justify-between rounded-2xl ">
                  <Calendar onChange={() => {}} />
                  <div className="">
                    {/* <button>a</button>
                    <button>b</button>
                    <button>c</button> */}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full ">
                  <label className="text-[rgba(26,26,26,1)] text-[19px] font-black">
                    Feriados:
                  </label>
                  {feriados.map((feriado, i) => {
                    if (
                      i < 4 &&
                      inicio &&
                      fim &&
                      new Date(feriado.date) >= inicio &&
                      new Date(feriado.date) <= fim
                    ) {
                      return (
                        <div
                          key={i}
                          className="flex w-full h-15 border border-[rgba(0,0,0,0.21)] rounded-2xl items-center gap-3"
                        >
                          <div className="w-15 h-full flex justify-center items-center  ">
                            <div className="text-[rgba(255,208,69,1)] w-full  h-full text-[30px] font-semibold flex items-center justify-center text-center leading-none ">
                              {feriado.date.split("-")[2]}
                            </div>
                            <span className="h-full w-px bg-[rgba(0,0,0,0.21)]"></span>
                          </div>

                          <span className="line-clamp-2 ">{feriado.name}</span>
                        </div>
                      );
                    } else if (
                      inicio &&
                      fim &&
                      new Date(feriado.date) >= inicio &&
                      new Date(feriado.date) <= fim &&
                      i >= 4 &&
                      i < 5
                    ) {
                      return (
                        <motion.button
                          key={i}
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.978 }}
                          className="cursor-pointer font-semibold self-center mt-1"
                        >
                          ver mais
                        </motion.button>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
