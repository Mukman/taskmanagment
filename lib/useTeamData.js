"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useTeamData(profile) {
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    // Directors see everyone; managers see only people whose manager_id is them.
    const teamQuery =
      profile.role === "director"
        ? supabase.from("profiles").select("*").neq("id", profile.id)
        : supabase.from("profiles").select("*").eq("manager_id", profile.id);

    const { data: teamData } = await teamQuery;
    setTeam(teamData || []);

    const ownerIds = (teamData || []).map((t) => t.id);
    if (ownerIds.length > 0) {
      const { data: taskData } = await supabase.from("tasks").select("*").in("owner", ownerIds).order("created_at", { ascending: false });
      setTasks(taskData || []);
    } else {
      setTasks([]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id, profile.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { team, tasks, loading, reload: loadData };
}
