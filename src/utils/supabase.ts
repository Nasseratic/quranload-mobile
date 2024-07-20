import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Database } from "types/Supabase";

export const supabase = createClient<Database>(
  "https://onvbwwnhwmeckrxkjllj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udmJ3d25od21lY2tyeGtqbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIzMzgzNTYsImV4cCI6MjAyNzkxNDM1Nn0.woIXVu4JVpVavBjinKZAK3zRyJ8OckRSzkvL4AIhz50"
);
