"use client";
import { Calendar, DatePicker } from "@/components/DatePicker";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, scale } from "framer-motion";
import { BusFront, ChevronDown, TrainFront, TramFront, X } from "lucide-react";
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
  const [passagens, setPassagens] = useState<number[]>([]);
  const [valores, setValores] = useState<string[]>([]);
  const [diasContados, setDiasContados] = useState<number>(0);
  const [totalDias, setTotalDias] = useState<number>(0);
  const [feriadosContados, setFeriadosContados] = useState(0);
  const [preco, setPreco] = useState<number>(0);
  const [week, setWeek] = useState(selected);
  const [bus, setBus] = useState(false);
  const [train, setTrain] = useState(false);
  const [tram, setTram] = useState(false);
  const [feriados, setFeriados] = useState<Array<Feriado>>([]);
  const [verMais, setVerMais] = useState(false);
  const [ativos, setAtivos] = useState(0);

  useEffect(() => {
    let count = 0;
    if (bus) count++;
    if (train) count++;
    if (tram) count++;

    setAtivos(count);

    // Ajusta os arrays dinamicamente
    setPassagens((prev) => {
      const novo = [...prev];
      while (novo.length < count) novo.push(0);
      return novo.slice(0, count);
    });

    setValores((prev) => {
      const novo = [...prev];
      while (novo.length < count) novo.push("");
      return novo.slice(0, count);
    });
  }, [bus, train, tram]);

  function calcularPreco(diasContados: number) {
    let total = 0;

    for (let i = 0; i < ativos; i++) {
      const valorNumerico = parseFloat(
        (valores[i] || "0")
          .replace(/[R$ ]/g, "")
          .replace(".", "")
          .replace(",", "."),
      );

      total += (passagens[i] || 0) * valorNumerico;
    }

    setPreco(total * diasContados);
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
      {verMais && (
        <div className="absolute w-screen h-screen bg-[rgba(0,0,0,0.23)] backdrop-blur-[2px] z-1000 left-0 bottom-0 flex">
          <div className="flex flex-col m-auto z-900 rounded-3xl w-120 h-120 max-h-120 overflow-x-hidden">
            <div className=" flex flex-col gap-2 p-3 overflow-y-auto custom-scroll w-full h-full bg-white rounded-3xl ">
              <X
                onClick={() => {
                  setVerMais(!verMais);
                }}
                className="ml-auto min-h-fit size-7 cursor-pointer"
              />
              {feriados.map((feriado, i) => {
                if (
                  inicio &&
                  fim &&
                  new Date(feriado.date) >= inicio &&
                  new Date(feriado.date) <= fim
                ) {
                  return (
                    <div
                      key={i}
                      className="flex w-full min-h-15 border  border-[rgba(0,0,0,0.21)] rounded-2xl items-center gap-3"
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
                }
              })}
            </div>
          </div>
          <div
            onClick={() => {
              setVerMais(!verMais);
            }}
            className="absolute w-screen h-screen left-0 bottom-0 "
          ></div>
        </div>
      )}

      <header className="w-full min-h-18 bg-white shadow-md">
        <h1 className="font-bold text-[28px] flex items-center p-3 text-[#f0c15b]">
          Calculadora de Transporte Docente
        </h1>
      </header>

      <div className="h-full min-h-fit py-5 w-full flex flex-col justify-center  items-center">
        {/* -------------------------------------------- */}
        <div
          className={`max-h-[95%] max-w-[95%] ${ativos === 0 ? "h-146" : "h-[698.5px]"}  overflow-hidden min-h-fit transition-all duration-300 ease-in-out gap-5 md:flex-row flex flex-col justify-center items-center `}
        >
          <div className="w-fit rounded-2xl h-full max-h-full  ">
            <div className="min-w-90 w-110 max-h-175 h-full custom-scroll overflow-y-auto bg-white rounded-2xl shadow-lg max-w-full flex flex-col p-5 gap-3">
              <div className="flex flex-col gap-8 ">
                <div className="">
                  <h1 className="text-[26px] font-bold text-[rgba(215,171,42,1)]">
                    Se planeje mais rápido!
                  </h1>
                  <p className="text-neutral-500 text-[15px]">
                    Simule o pagamento de seus funcionários de forma simples e
                    descomplicada
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[rgba(26,26,26,1)] text-[19px]">
                    Período escolar
                  </label>
                  <div className="flex justify-between">
                    <div className="text-neutral-500 ">
                      <label className="text-[15px]">Início</label>
                      <DatePicker onChange={setInicio} onChangePreset={1} />
                    </div>
                    <div className="text-neutral-500">
                      <label className="text-[15px]">Fim</label>
                      <DatePicker onChange={setFim} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[rgba(26,26,26,1)] text-[19px] ">
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
                        className="w-12 h-12 cursor-pointer rounded-full text-black text-[15px]"
                      >
                        {(() => {
                          const abbr = days[i].slice(0, 3);
                          return (
                            abbr.charAt(0).toUpperCase() +
                            abbr.slice(1).toLowerCase()
                          );
                        })()}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[rgba(26,26,26,1)] text-[19px]">
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

                {Array.from({ length: ativos }).map((_, i) => (
                  <div key={i} className="flex justify-between ">
                    <div className="flex flex-col gap-2">
                      <label className="text-[19px]">Passagens </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={passagens[i] === 0 ? "" : passagens[i]}
                        onChange={(e) => {
                          const novo = [...passagens];
                          novo[i] =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setPassagens(novo);
                        }}
                        className="border-gray-400 max-w-44 p-2.5 h-12 rounded-[15px] border"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[19px]">Valor unitário</label>
                      <NumericFormat
                        value={valores[i] || ""}
                        prefix="R$ "
                        placeholder="R$ 0,00"
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        onValueChange={(values) => {
                          const novo = [...valores];
                          novo[i] = values.formattedValue;
                          setValores(novo);
                        }}
                        className="border-gray-400 max-w-44 p-2.5 h-12 rounded-[15px] border"
                      />
                    </div>
                  </div>
                ))}

                <motion.button
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (inicio && fim) {
                      const dias = contarDiasSelecionadosSemFeriados(
                        inicio,
                        fim,
                        week,
                        feriados,
                      );

                      calcularPreco(dias);
                    }
                  }}
                  className="py-3 px-4 cursor-pointer rounded-2xl w-fit bg-[#ffd045] self-center"
                >
                  Calcular
                </motion.button>
              </div>
            </div>
          </div>

          <div className="w-220 max-h-full h-full flex flex-col gap-4 ">
            <div className="text-white flex flex-col justify-center items-center min-h-[22%] w-full bg-[#ffd045] rounded-2xl shadow-lg">
              <span className="text-amber-800 text-lg">
                Pagamento estimado{" "}
              </span>
              <h1 className="font-bold text-[35px]">
                {preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </h1>
            </div>
            <div className="bg-white rounded-2xl w-full h-full flex overflow-y-auto custom-scroll flex-col shadow-lg p-5 gap-5">
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

              <div className="flex gap-7 w-full h-full max-xl:flex-col ">
                <div className="min-w-110 h-full min-h-64 flex flex-col justify-between rounded-2xl ">
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
                          className="flex w-full max-w-120 h-15 border border-[rgba(0,0,0,0.21)] rounded-2xl items-center gap-3"
                        >
                          <div className="min-w-15 h-full flex justify-center items-center  ">
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
                          onClick={() => {
                            setVerMais(true);
                          }}
                          className="cursor-pointer font-semibold self-center mt-1 mb-2"
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
