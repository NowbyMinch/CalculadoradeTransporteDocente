import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.feriados.dev/v1/holidays?year=2024&state=SP",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Next.js Server",
        },
        cache: "no-store",
      }
    );

    const text = await res.text();

    if (!res.ok) {
      console.error("Erro API externa:", res.status, text);
      return NextResponse.json(
        { error: "Erro na API externa", status: res.status },
        { status: 502 }
      );
    }

    if (!text) {
      console.error("Resposta vazia da API externa");
      return NextResponse.json(
        { error: "Resposta vazia da API externa" },
        { status: 502 }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro interno da rota /api/feriados:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
