import { NextResponse } from "next/server";
import { MOCK_RISK_DATA } from "@/lib/data";

export async function POST(request: Request) {
  const { state, district } = await request.json();
  
  // Simulate heavy computation / AI inference delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Logic to return a variety of data based on input
  // In a real app, this would query a model or database
  const riskLevels = ["Low", "Medium", "High", "Critical"];
  const seed = (state?.length || 0) + (district?.length || 0);
  const riskLevel = riskLevels[seed % riskLevels.length];
  
  const data = MOCK_RISK_DATA[riskLevel];
  
  return NextResponse.json(data);
}
