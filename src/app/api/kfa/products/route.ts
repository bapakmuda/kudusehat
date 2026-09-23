import { NextResponse } from "next/server";

// Mock Data Kamus Farmasi dan Alat Kesehatan (KFA) - SatuSehat
const KFA_MOCK_DATA = [
  { kfa_code: "93000601", name: "Paracetamol 500 mg Tablet", form: "Tablet", active_ingredients: "Paracetamol" },
  { kfa_code: "93000602", name: "Paracetamol 120 mg/5 ml Sirup", form: "Sirup", active_ingredients: "Paracetamol" },
  { kfa_code: "93000105", name: "Ibuprofen 400 mg Tablet", form: "Tablet", active_ingredients: "Ibuprofen" },
  { kfa_code: "93000106", name: "Ibuprofen 100 mg/5 ml Suspensi", form: "Suspensi", active_ingredients: "Ibuprofen" },
  { kfa_code: "93000781", name: "Amoxicillin 500 mg Kapsul", form: "Kapsul", active_ingredients: "Amoxicillin" },
  { kfa_code: "93000782", name: "Amoxicillin 125 mg/5 ml Sirup Kering", form: "Sirup Kering", active_ingredients: "Amoxicillin" },
  { kfa_code: "93000451", name: "Sanmol Drops 60 mg/0.6 ml", form: "Drops", active_ingredients: "Paracetamol" },
  { kfa_code: "93000452", name: "Tempra Sirup 160 mg/5 ml", form: "Sirup", active_ingredients: "Paracetamol" },
  { kfa_code: "93000888", name: "Cetirizine 10 mg Tablet", form: "Tablet", active_ingredients: "Cetirizine" },
  { kfa_code: "93000889", name: "Cetirizine 5 mg/5 ml Sirup", form: "Sirup", active_ingredients: "Cetirizine" },
  { kfa_code: "93000911", name: "Oralit Serbuk", form: "Serbuk", active_ingredients: "Glukosa, NaCl, KCl, Na Bikarbonat" },
  { kfa_code: "93000915", name: "Zinc 20 mg Tablet Dispersible", form: "Tablet", active_ingredients: "Zinc Sulfate" },
  { kfa_code: "93000916", name: "Zinc 10 mg/5 ml Sirup", form: "Sirup", active_ingredients: "Zinc Sulfate" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";

  // Simulate network delay to mimic real API
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!search) {
    return NextResponse.json({
      status: "success",
      total: 0,
      items: []
    });
  }

  const results = KFA_MOCK_DATA.filter(item => 
    item.name.toLowerCase().includes(search) || 
    item.active_ingredients.toLowerCase().includes(search)
  );

  return NextResponse.json({
    status: "success",
    total: results.length,
    items: results
  });
}
