"use client";
import { Calendar, CalendarRecesso, DatePicker } from "@/components/DatePicker";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BusFront, ChevronDown, TrainFront, TramFront, X } from "lucide-react";
import ValidationPopup from "@/components/ValidationPopup";
import { NumericFormat } from "react-number-format";
import { useFeriados } from "@/contexts/FeriadosContext";

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
  type?: string;
};

export default function Home() {
  const { feriados, setFeriados } = useFeriados();
  const [inicio, setInicio] = useState<Date | null>();
  const [fim, setFim] = useState<Date | null>();
  const [passagens, setPassagens] = useState<Array<number | undefined>>([]);
  const [valores, setValores] = useState<string[]>([]);
  const [diasContados, setDiasContados] = useState<number>(0);
  const [totalDias, setTotalDias] = useState<number>(0);
  const [feriadosContados, setFeriadosContados] = useState(0);
  const [preco, setPreco] = useState<number>(0);
  const [week, setWeek] = useState(selected);
  const [bus, setBus] = useState(false);
  const [train, setTrain] = useState(false);
  const [tram, setTram] = useState(false);
  const [ativos, setAtivos] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [algumFeriado, setAlgumFeriado] = useState(false);
  const [feriadosNoPeriodo, setFeriadosNoPeriodo] = useState<Array<Feriado>>(
    [],
  );
  const [recessos, setRecessos] = useState<Array<Feriado>>([]);
  const [verMais, setVerMais] = useState(false);
  const [adicionarRecesso, setAdicionarRecesso] = useState(false);

  function CloseAdicionarRecesso() {
    setAdicionarRecesso(false);
    setInicio(null);
    setFim(null);
    setRecessoData(undefined);
    setRecessoDataFinal(undefined);
    setRecessoNome("");
  }

  const [recessoNome, setRecessoNome] = useState<string>("");
  const [recessoData, setRecessoData] = useState<Date>();
  const [recessoDataFinal, setRecessoDataFinal] = useState<Date>();

  const dateReselectionHandler = useRef<Date | null>(null);

  useEffect(() => {
    let count = 0;
    if (bus) count++;
    if (train) count++;
    if (tram) count++;

    setAtivos(count);

    // Ajusta os arrays dinamicamente
    setPassagens((prev) => {
      const novo = [...prev];
      while (novo.length < count) novo.push(undefined);
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

      total += (passagens[i] ?? 0) * valorNumerico;
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
        setFeriados(data);
      } catch (err) {
        console.error("Erro ao buscar feriados:", err);
      }
    };

    buscar();
  }, []);

  useEffect(() => {
    if (inicio && fim) {
      setFeriadosNoPeriodo(
        feriados.filter((feriado) => {
          const dataFeriado = new Date(feriado.date);
          return dataFeriado >= inicio && dataFeriado <= fim;
        }),
      );

      if (feriadosNoPeriodo.length === 0) {
        setAlgumFeriado(false);
      } else {
        setAlgumFeriado(true);
      }
    }
  }, [inicio, fim]);

  // useEffect(() => {
  //   let atual = new Date().getTime();
  //   let depois = new Date("2026-02-22").getTime();

  //   while (atual < depois) {
  //     console.log(new Date(atual));
  //     atual += 1000 * 60 * 60 * 24; // Avança um dia
  //   }
  // }, []);

  const adicionar = () => {
    if (recessoNome.trim() === "" || !recessoData) {
      setAlertMessage("Preencha o nome e a data do recesso.");
      setAlertVisible(true);
      return;
    } else {
      if (recessoDataFinal && recessoDataFinal < recessoData) {
        setAlertMessage(
          "A data final do recesso deve ser posterior à data de início.",
        );
        setAlertVisible(true);
        return;
      } else if (recessoDataFinal) {
        const dataAtual = new Date(recessoData);
        while (dataAtual <= recessoDataFinal) {
          const novoFeriado: Feriado = {
            name: recessoNome,
            date: dataAtual.toISOString().split("T")[0],
          };
          setFeriados((prev) => [...prev, novoFeriado]);
          setRecessos((prev) => [...prev, novoFeriado]);
          dataAtual.setDate(dataAtual.getDate() + 1);
        }
      } else {
        const novoFeriado: Feriado = {
          name: recessoNome,
          date: recessoData.toISOString().split("T")[0],
        };
      }

      CloseAdicionarRecesso();
      // setFeriados((prev) => [...prev, novoFeriado]);
      // setRecessos((prev) => [...prev, novoFeriado]);
      // setAdicionarRecesso(false);
    }
  };

  const handleRecessoChange = (date: Date) => {
    // if the setRecessoDataFinal is greater than the setRecessoData is inverts the date values;

    if (!recessoData) {
      setRecessoData(date);
      dateReselectionHandler.current = date;
      return;
    } else {
      setRecessoDataFinal(date);
      console.log("True 1");

      if (recessoData && date) {
        console.log("True 2");

        if (
          date &&
          dateReselectionHandler.current &&
          date.getDate() < dateReselectionHandler.current.getDate()
        ) {
          console.log("Fun 1 ");
          setRecessoDataFinal(dateReselectionHandler.current);
          setRecessoData(date);
        }
      }
      return;
    }

    // else {
    //   // Reset and start again
    //   setRecessoData(date);
    //   setRecessoDataFinal(undefined);
    // }
  };

  return (
    <>
      {verMais && (
        <div className="absolute w-screen h-screen bg-[rgba(0,0,0,0.23)] backdrop-blur-[2px] z-1000 left-0 bottom-0 flex p-4">
          <div className="flex flex-col m-auto z-900 rounded-3xl  w-120 h-120 max-h-120 overflow-x-hidden ">
            <div className=" flex flex-col gap-2 p-3 overflow-y-auto custom-scroll w-full h-full bg-white rounded-3xl ">
              <X
                onClick={() => {
                  setVerMais(!verMais);
                }}
                className="ml-auto min-h-fit size-7 cursor-pointer"
              />
              {feriadosNoPeriodo.map((feriado, i) => {
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

      {adicionarRecesso && (
        <div className=" overflow-y-auto  absolute w-screen h-screen bg-[rgba(0,0,0,0.23)] backdrop-blur-[2px] z-1000 left-0 bottom-0 flex p-4">
          <div className="flex flex-col m-auto z-900 rounded-3xl max-w-full ">
            <div className=" flex flex-col gap-2 p-3 w-full h-full bg-white rounded-3xl ">
              <X
                onClick={() => {
                  CloseAdicionarRecesso();
                }}
                className="ml-auto min-h-fit size-7 cursor-pointer"
              />
              <div className=" w-full ">
                <CalendarRecesso
                  onChange={handleRecessoChange}
                  inicio={recessoData}
                  fim={recessoDataFinal}
                  onChangePreset={1}
                />
              </div>

              <div className=" flex flex-col gap-5 my-3 ">
                <div className="flex PeriodoEscolar w-full gap-3 ">
                  <div className="w-46 max-w-full  ">
                    <label className="text-[15px]">Início</label>
                    <div className="sm:flex hidden w-full">
                      <DatePicker
                        onChange={setRecessoData}
                        selected={
                          recessoData
                            ? recessoData.toISOString().split("T")[0]
                            : ""
                        }
                        onChangePreset={2}
                      />
                    </div>
                    <div className="sm:hidden w-full">
                      <DatePicker
                        onChange={setRecessoData}
                        selected={
                          recessoData
                            ? recessoData.toISOString().split("T")[0]
                            : ""
                        }
                        onChangePreset={3}
                      />
                    </div>
                  </div>

                  <div className="w-46 max-w-full">
                    <label className="text-[15px]">Fim (opicional)</label>
                    <div className="sm:flex hidden w-full">
                      <DatePicker
                        onChange={setRecessoDataFinal}
                        selected={
                          recessoDataFinal
                            ? recessoDataFinal.toISOString().split("T")[0]
                            : ""
                        }
                        onChangePreset={2}
                      />
                    </div>
                    <div className="sm:hidden w-full">
                      <DatePicker
                        onChange={setRecessoDataFinal}
                        selected={
                          recessoDataFinal
                            ? recessoDataFinal.toISOString().split("T")[0]
                            : ""
                        }
                        onChangePreset={3}
                      />
                    </div>
                  </div>
                </div>

                <div className=" w-80 max-w-full ">
                  <label className="text-[15px]">Nome do Recesso</label>
                  <input
                    type="text"
                    value={recessoNome}
                    onChange={(e) => setRecessoNome(e.target.value)}
                    placeholder="Nome do Recesso"
                    className={`text-black w-full max-w-full relative cursor-text pl-2 h-12 gap-1 text-[16px] flex rounded-[15px] border `}
                  />
                </div>

                <motion.button
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    adicionar();
                  }}
                  className="py-3 px-4 cursor-pointer rounded-2xl w-fit bg-[#ffd045] self-center"
                >
                  Adicionar Recesso
                </motion.button>
              </div>
            </div>
          </div>
          <div
            onClick={() => {
              CloseAdicionarRecesso();
            }}
            className="absolute w-screen h-screen left-0 bottom-0 "
          ></div>
        </div>
      )}

      <header className="w-full min-h-18 bg-white shadow-md px-3 flex items-center">
        <h1 className=" max-w-full w-fit max-h-full leading-snug  line-clamp-2  font-bold text-[25px] text-[#f0c15b]">
          Calculadora de Transporte Docente
        </h1>
      </header>

      <div className="h-full min-h-fit py-5 w-full flex  justify-center items-center">
        {/* -------------------------------------------- */}
        <div
          className={`max-h-[95%] max-w-[95%] ${ativos === 0 ? "lg:h-160" : "lg:h-175"}  flex flex-col lg:flex-row  min-h-fit transition-all duration-300 ease-in-out gap-5   justify-center items-center `}
        >
          <div className=" rounded-2x lg:w-fit w-full h-full max-h-full ">
            <div className=" w-full lg:w-110 lg:max-h-175 h-full custom-scroll overflow-y-auto bg-white rounded-2xl shadow-lg max-w-full flex flex-col p-5 gap-3">
              <div className="flex flex-col gap-8 ">
                <div className="">
                  <h1 className="leading-snug text-[26px] font-bold text-[#f0c15b]">
                    Se planeje mais rápido!
                  </h1>
                  <p className="text-neutral-500 text-[15px]">
                    Simule o pagamento de seus funcionários de forma simples e
                    descomplicada
                  </p>
                </div>
                <div className="flex flex-col gap-2 ">
                  <label className="text-[rgba(26,26,26,1)] text-[18px]">
                    Período escolar
                  </label>
                  <div className="flex PeriodoEscolar gap-3">
                    <div className="text-neutral-500 max-w-full w-46 ">
                      <label className="text-[15px]">Início</label>
                      <DatePicker onChange={setInicio} onChangePreset={1} />
                    </div>
                    <div className="text-neutral-500 max-w-full w-46">
                      <label className="text-[15px]">Fim</label>
                      <div className="OverflowCalendarVar">
                        <DatePicker onChange={setFim} onChangePreset={1} />
                      </div>
                      <div className="OverflowCalendar">
                        <DatePicker onChange={setFim} onChangePreset={2} />
                      </div>

                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[rgba(26,26,26,1)] text-[18px] ">
                    Dias da semana
                  </label>
                  <div className="flex gap-1 justify-between ">
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
                        }}
                        style={{
                          backgroundColor: week[days[i]]
                            ? "rgba(255,208,69,1)"
                            : "rgba(217,217,217,1)",
                        }}
                        className="w-12 h-12  cursor-pointer rounded-full text-black text-[14px]"
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
                  <label className="text-[rgba(26,26,26,1)] text-[18px]">
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
                  <div key={i} className="flex gap-3  PeriodoEscolar">
                    <div className="flex flex-col gap-2">
                      <label className="text-[18px]">Passagens </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={passagens[i] === undefined ? "" : passagens[i]}
                        onChange={(e) => {
                          const novo = [...passagens];
                          novo[i] =
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value);
                          setPassagens(novo);
                        }}
                        className="border-gray-400 w-46 max-w-full p-2.5 h-12 rounded-[15px] border"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[18px]">Valor unitário</label>
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
                    if (!inicio || !fim) {
                      let msg = "";
                      if (!inicio && !fim) {
                        msg = "Preencha o início e o fim do período escolar.";
                      } else if (!inicio) {
                        msg = "Preencha a data de início do período escolar.";
                      } else {
                        msg = "Preencha a data de fim do período escolar.";
                      }
                      setAlertMessage(msg);
                      setAlertVisible(true);
                      return;
                    }
                    if (inicio > fim) {
                      setAlertMessage(
                        "A data de fim do período escolar deve ser posterior a data de início.",
                      );
                      setAlertVisible(true);
                      return;
                    }

                    if (Object.values(week).every((v) => !v)) {
                      setAlertMessage(
                        "Selecione pelo menos um dia da semana que o funcionário trabalha.",
                      );
                      setAlertVisible(true);
                      return;
                    }

                    for (let i = 0; i < ativos; i++) {
                      const numPassagens = passagens[i];

                      if (numPassagens === undefined) {
                        setAlertMessage(
                          "Preencha o número de passagens para o transporte selecionado.",
                        );
                        setAlertVisible(true);
                        return;
                      }

                      if (numPassagens <= 0) {
                        setAlertMessage(
                          "O número de passagens deve ser maior que 0.",
                        );
                        setAlertVisible(true);
                        return;
                      }

                      const valorNumerico = parseFloat(
                        (valores[i] || "0")
                          .replace(/[R$ ]/g, "")
                          .replace(".", "")
                          .replace(",", "."),
                      );

                      if (isNaN(valorNumerico) || valorNumerico <= 0) {
                        setAlertMessage(
                          "O valor unitário deve ser maior que R$0,00.",
                        );
                        setAlertVisible(true);
                        return;
                      }
                    }

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

          <div className="lg:w-220 w-full max-h-full h-full flex flex-col gap-4 ">
            <div className="text-white flex flex-col justify-center items-center min-h-[22%] w-full bg-[#ffd045] rounded-2xl shadow-lg py-5">
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
                <div className="flex justify-between ">
                  <h1 className="text-[26px] font-semibold text-[#f0c15b]">
                    Calendário
                  </h1>
                  <motion.button
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                    gap-1 cursor-pointer text-[15px] hidden lg:flex w-fit h-fit p-2 rounded-[10px] border border-[rgba(0,0,0,0.18)] bg-[rgba(244,244,244,1)]"
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
                <div className="lg:min-w-110  h-full min-h-64 flex flex-col justify-between rounded-2xl gap-3">
                  <motion.button
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                    gap-1 cursor-pointer text-[15px] truncate lg:hidden flex w-fit h-fit p-2 rounded-[10px] border border-[rgba(0,0,0,0.18)] bg-[rgba(244,244,244,1)]"
                  >
                    Rio de Janeiro, RJ
                    <ChevronDown className="text-gray-500" />
                  </motion.button>

                  <Calendar onChange={() => {}} />
                  <div className="">
                    {/* <button>a</button>
                    <button>b</button>
                    <button>c</button> */}
                  </div>
                  {/* <div className="w-full h-10 "></div> */}
                </div>

                <div className="flex flex-col gap-2 w-full ">
                  <label className="text-[rgba(26,26,26,1)] text-[18px] font-black">
                    Feriados:
                  </label>

                  {algumFeriado ? (
                    feriadosNoPeriodo.map((feriado, i) => {
                      if (i < 3) {
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

                            <span className="line-clamp-2 ">
                              {feriado.name}
                            </span>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <div className="flex w-full max-w-120 border border-[rgba(0,0,0,0.21)] rounded-2xl items-center gap-3  flex-col justify-center  p-5 ">
                      <span className="line-clamp-2 self-center ">
                        Não há feriados no período selecionado.
                      </span>
                    </div>
                  )}

                  <motion.button
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setAdicionarRecesso(true)}
                    className="w-full max-w-120 bg-[#F4F4F4] border border-[#0000002E] p-2 rounded-xl cursor-pointer "
                  >
                    + Adicionar novo recesso
                  </motion.button>
                  {/* <div className="flex w-full max-w-120 border border-[rgba(0,0,0,0.21)] rounded-2xl items-center gap-3  flex-col justify-center  p-5 ">
                    <span className="line-clamp-2 self-center ">
                      Recessos não oficiais para cálculo mais preciso.
                    </span>
                  </div> */}

                  {algumFeriado && feriadosNoPeriodo.length > 3 && (
                    <div className="flex justify-center mt-2">
                      <motion.button
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.978 }}
                        onClick={() => {
                          setVerMais(true);
                        }}
                        className="cursor-pointer font-semibold self-center mt-1 "
                      >
                        ver mais
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
              {/* 
              <label className="text-[rgba(26,26,26,1)] text-[18px] font-black mt-2">
                Recessos:
              </label>
               */}
            </div>
          </div>
        </div>
      </div>
      <ValidationPopup
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </>
  );
}
