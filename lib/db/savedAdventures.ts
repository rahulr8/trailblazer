import { supabase } from "@/lib/supabase";
import type { Json } from "@/types/supabase";
import type { Adventure } from "@/lib/data";

export async function saveAdventure(
  uid: string,
  adventure: Adventure,
): Promise<void> {
  await supabase.from("saved_adventures").upsert(
    {
      user_id: uid,
      adventure_id: adventure.id.toString(),
      adventure_data: adventure as unknown as Json,
    },
    { onConflict: "user_id,adventure_id" },
  );
}

export async function removeSavedAdventure(
  uid: string,
  adventureId: number,
): Promise<void> {
  await supabase
    .from("saved_adventures")
    .delete()
    .eq("user_id", uid)
    .eq("adventure_id", adventureId.toString());
}

export async function getSavedAdventures(uid: string): Promise<Adventure[]> {
  const { data, error } = await supabase
    .from("saved_adventures")
    .select("adventure_data")
    .eq("user_id", uid);

  if (error) throw error;
  return (data ?? []).map((row) => row.adventure_data as unknown as Adventure);
}

export async function isAdventureSaved(
  uid: string,
  adventureId: number,
): Promise<boolean> {
  const { data } = await supabase
    .from("saved_adventures")
    .select("id")
    .eq("user_id", uid)
    .eq("adventure_id", adventureId.toString())
    .maybeSingle();

  return data !== null;
}
