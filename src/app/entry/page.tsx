"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EntryPage() {
  const [patientName, setPatientName] = useState("");
  const [physiotherapy, setPhysiotherapy] = useState("");
  const [physiology, setPhysiology] = useState("");
  const [biomechanics, setBiomechanics] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [psychology, setPsychology] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const submitForm = async () => {
    setLoading(true);

    await addDoc(collection(db, "entries"), {
      patientName,
      physiotherapy,
      physiology,
      biomechanics,
      nutrition,
      psychology,
      createdAt: Timestamp.now(),
    });

    setLoading(false);
    setSuccess("Entry Saved Successfully 🎉");

    setPatientName("");
    setPhysiotherapy("");
    setPhysiology("");
    setBiomechanics("");
    setNutrition("");
    setPsychology("");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Physiotherapy Entry</h1>

      {success && <p className="text-green-600">{success}</p>}

      <Input
        placeholder="Patient Name"
        value={patientName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientName(e.target.value)}
      />

      <Textarea placeholder="Physiotherapy Notes" value={physiotherapy} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPhysiotherapy(e.target.value)} />
      <Textarea placeholder="Physiology Notes" value={physiology} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPhysiology(e.target.value)} />
      <Textarea placeholder="Biomechanics Notes" value={biomechanics} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBiomechanics(e.target.value)} />
      <Textarea placeholder="Nutrition Notes" value={nutrition} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNutrition(e.target.value)} />
      <Textarea placeholder="Psychology Notes" value={psychology} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPsychology(e.target.value)} />

      <Button className="w-full" onClick={submitForm} disabled={loading}>
        {loading ? "Saving..." : "Save Entry"}
      </Button>
    </div>
  );
}
