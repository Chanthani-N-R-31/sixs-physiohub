"use client";



import { useState } from "react";

import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";



export default function PhysioFormPage() {

  const router = useRouter();

  const currentUser = auth.currentUser;



  // Basic demographics / injury / notes state

  const [patientName, setPatientName] = useState("");

  const [dob, setDob] = useState("");

  const [gender, setGender] = useState("");

  const [rank, setRank] = useState("");

  const [dateOfAssessment, setDateOfAssessment] = useState("");

  const [previousInjuries, setPreviousInjuries] = useState("");

  const [diagnosis, setDiagnosis] = useState("");

  const [side, setSide] = useState("");

  const [durationAgo, setDurationAgo] = useState("");

  const [methodOfManagement, setMethodOfManagement] = useState("");

  const [recoveryStatus, setRecoveryStatus] = useState("");

  const [chiefComplaints, setChiefComplaints] = useState("");

  const [history, setHistory] = useState("");

  const [painSeverity, setPainSeverity] = useState<number | "">("");

  const [assessmentFindings, setAssessmentFindings] = useState("");

  const [imagingDiagnosis, setImagingDiagnosis] = useState("");

  const [modeOfTreatment, setModeOfTreatment] = useState("");



  // --- Static posture (anterior view)

  const [headTilt, setHeadTilt] = useState("");

  const [shoulderAlignment, setShoulderAlignment] = useState("");

  const [trunkAlignment, setTrunkAlignment] = useState("");

  const [pelvicAlignment, setPelvicAlignment] = useState("");

  const [kneeAlignmentAnterior, setKneeAlignmentAnterior] = useState("");



  // --- Static posture (lateral view)

  const [headAlignmentLat, setHeadAlignmentLat] = useState("");

  const [shoulderAlignmentLat, setShoulderAlignmentLat] = useState("");

  const [spinalCurves, setSpinalCurves] = useState("");

  const [pelvicTilt, setPelvicTilt] = useState("");

  const [kneeAlignmentLat, setKneeAlignmentLat] = useState("");



  // --- ROM (simple numeric inputs)

  const [ankleDorsiflexion, setAnkleDorsiflexion] = useState<number | "">("");

  const [hipFlexion, setHipFlexion] = useState<number | "">("");

  const [hipExtension, setHipExtension] = useState<number | "">("");

  const [poplitealAngle, setPoplitealAngle] = useState<number | "">("");

  const [thomasTest, setThomasTest] = useState<number | "">("");

  const [shoulderFlexion, setShoulderFlexion] = useState<number | "">("");

  const [apleyRight, setApleyRight] = useState<number | "">("");

  const [apleyLeft, setApleyLeft] = useState<number | "">("");

  const [thoracicRotation, setThoracicRotation] = useState<number | "">("");



  // --- Strength & stability

  const [singleLegSquatNote, setSingleLegSquatNote] = useState("");

  const [sidePlankRight, setSidePlankRight] = useState<number | "">("");

  const [sidePlankLeft, setSidePlankLeft] = useState<number | "">("");

  const [plankHold, setPlankHold] = useState<number | "">("");

  const [singleLegBridgeHold, setSingleLegBridgeHold] = useState<number | "">("");

  const [calfRaiseReps, setCalfRaiseReps] = useState<number | "">("");

  const [gripStrength, setGripStrength] = useState<number | "">("");

  const [copenhagenHold, setCopenhagenHold] = useState<number | "">("");



  // --- Functional Movement Screening (FMS) scores 0-3 or notes

  const [deepSquat, setDeepSquat] = useState<number | "">("");

  const [hurdleStep, setHurdleStep] = useState<number | "">("");

  const [inlineLunge, setInlineLunge] = useState<number | "">("");

  const [shoulderMobility, setShoulderMobility] = useState<number | "">("");

  const [activeStraightLegRaise, setActiveStraightLegRaise] = useState<number | "">("");

  const [trunkStabilityPushup, setTrunkStabilityPushup] = useState<number | "">("");

  const [rotaryStability, setRotaryStability] = useState<number | "">("");



  // UI state

  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");

  const [errorMsg, setErrorMsg] = useState("");



  const resetForm = () => {

    setPatientName("");

    setDob("");

    setGender("");

    setRank("");

    setDateOfAssessment("");

    setPreviousInjuries("");

    setDiagnosis("");

    setSide("");

    setDurationAgo("");

    setMethodOfManagement("");

    setRecoveryStatus("");

    setChiefComplaints("");

    setHistory("");

    setPainSeverity("");

    setAssessmentFindings("");

    setImagingDiagnosis("");

    setModeOfTreatment("");



    setHeadTilt("");

    setShoulderAlignment("");

    setTrunkAlignment("");

    setPelvicAlignment("");

    setKneeAlignmentAnterior("");



    setHeadAlignmentLat("");

    setShoulderAlignmentLat("");

    setSpinalCurves("");

    setPelvicTilt("");

    setKneeAlignmentLat("");



    setAnkleDorsiflexion("");

    setHipFlexion("");

    setHipExtension("");

    setPoplitealAngle("");

    setThomasTest("");

    setShoulderFlexion("");

    setApleyRight("");

    setApleyLeft("");

    setThoracicRotation("");



    setSingleLegSquatNote("");

    setSidePlankRight("");

    setSidePlankLeft("");

    setPlankHold("");

    setSingleLegBridgeHold("");

    setCalfRaiseReps("");

    setGripStrength("");

    setCopenhagenHold("");



    setDeepSquat("");

    setHurdleStep("");

    setInlineLunge("");

    setShoulderMobility("");

    setActiveStraightLegRaise("");

    setTrunkStabilityPushup("");

    setRotaryStability("");

  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    setErrorMsg("");

    setSuccessMsg("");



    if (!patientName.trim()) {

      setErrorMsg("Please enter patient name.");

      return;

    }



    setLoading(true);

    try {

      const docRef = await addDoc(collection(db, "physioEntries"), {

        // demographics

        patientName,

        dob,

        gender,

        rank,

        dateOfAssessment,

        createdBy: auth.currentUser ? auth.currentUser.uid : null,



        // injury

        previousInjuries,

        diagnosis,

        side,

        durationAgo,

        methodOfManagement,

        recoveryStatus,

        chiefComplaints,

        history,

        painSeverity: painSeverity === "" ? null : Number(painSeverity),

        assessmentFindings,

        imagingDiagnosis,

        modeOfTreatment,



        // posture (anterior)

        postureAnterior: {

          headTilt,

          shoulderAlignment,

          trunkAlignment,

          pelvicAlignment,

          kneeAlignmentAnterior,

        },



        // posture (lateral)

        postureLateral: {

          headAlignmentLat,

          shoulderAlignmentLat,

          spinalCurves,

          pelvicTilt,

          kneeAlignmentLat,

        },



        // ROM

        rom: {

          ankleDorsiflexion: ankleDorsiflexion === "" ? null : Number(ankleDorsiflexion),

          hipFlexion: hipFlexion === "" ? null : Number(hipFlexion),

          hipExtension: hipExtension === "" ? null : Number(hipExtension),

          poplitealAngle: poplitealAngle === "" ? null : Number(poplitealAngle),

          thomasTest: thomasTest === "" ? null : Number(thomasTest),

          shoulderFlexion: shoulderFlexion === "" ? null : Number(shoulderFlexion),

          apleyRight: apleyRight === "" ? null : Number(apleyRight),

          apleyLeft: apleyLeft === "" ? null : Number(apleyLeft),

          thoracicRotation: thoracicRotation === "" ? null : Number(thoracicRotation),

        },



        // strength & stability

        strength: {

          singleLegSquatNote,

          sidePlankRight: sidePlankRight === "" ? null : Number(sidePlankRight),

          sidePlankLeft: sidePlankLeft === "" ? null : Number(sidePlankLeft),

          plankHold: plankHold === "" ? null : Number(plankHold),

          singleLegBridgeHold: singleLegBridgeHold === "" ? null : Number(singleLegBridgeHold),

          calfRaiseReps: calfRaiseReps === "" ? null : Number(calfRaiseReps),

          gripStrength: gripStrength === "" ? null : Number(gripStrength),

          copenhagenHold: copenhagenHold === "" ? null : Number(copenhagenHold),

        },



        // FMS

        fms: {

          deepSquat: deepSquat === "" ? null : Number(deepSquat),

          hurdleStep: hurdleStep === "" ? null : Number(hurdleStep),

          inlineLunge: inlineLunge === "" ? null : Number(inlineLunge),

          shoulderMobility: shoulderMobility === "" ? null : Number(shoulderMobility),

          activeStraightLegRaise: activeStraightLegRaise === "" ? null : Number(activeStraightLegRaise),

          trunkStabilityPushup: trunkStabilityPushup === "" ? null : Number(trunkStabilityPushup),

          rotaryStability: rotaryStability === "" ? null : Number(rotaryStability),

        },



        createdAt: serverTimestamp(),

      });



      setSuccessMsg("Physiotherapy entry saved successfully.");

      resetForm();

      // optional: navigate to entries list / detail

      // router.push('/dashboard/entries');

    } catch (err: unknown) {

      console.error("Save failed", err);

      const error = err as { message?: string };

      setErrorMsg(error.message || "Failed to save entry. Please try again.");

    }



    setLoading(false);

  };



  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">

          <h1 className="text-2xl font-bold">Physiotherapy - Screening Data Collection</h1>

          <div className="text-sm text-gray-500">Template: PT Screening Data Form</div>

        </div>



        {errorMsg && <div className="mb-4 text-red-600">{errorMsg}</div>}

        {successMsg && <div className="mb-4 text-green-600">{successMsg}</div>}



        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md border">

          {/* Section 1 - Demographic */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Demographic Details</h2>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input

                className="p-3 border rounded"

                placeholder="Name"

                value={patientName}

                onChange={(e) => setPatientName(e.target.value)}

              />



              <input

                type="date"

                className="p-3 border rounded"

                placeholder="DOB"

                value={dob}

                onChange={(e) => setDob(e.target.value)}

              />



              <select className="p-3 border rounded" value={gender} onChange={(e) => setGender(e.target.value)}>

                <option value="">Gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>

                <option value="Other">Other</option>

              </select>



              <input

                className="p-3 border rounded"

                placeholder="Army Rank"

                value={rank}

                onChange={(e) => setRank(e.target.value)}

              />



              <input

                type="date"

                className="p-3 border rounded"

                placeholder="Date of Assessment"

                value={dateOfAssessment}

                onChange={(e) => setDateOfAssessment(e.target.value)}

              />

            </div>

          </section>



          {/* Section 2 - Injury History */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Injury History</h2>



            <div className="grid grid-cols-1 gap-4">

              <textarea

                className="p-3 border rounded"

                placeholder="Previous Injuries (If applicable)"

                value={previousInjuries}

                onChange={(e) => setPreviousInjuries(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Diagnosis"

                value={diagnosis}

                onChange={(e) => setDiagnosis(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Side (Left/Right)"

                value={side}

                onChange={(e) => setSide(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Duration (How long ago)"

                value={durationAgo}

                onChange={(e) => setDurationAgo(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Method of management – Rehab/Surgery/None"

                value={methodOfManagement}

                onChange={(e) => setMethodOfManagement(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Recovery status – Partially recovered/Fully recovered"

                value={recoveryStatus}

                onChange={(e) => setRecoveryStatus(e.target.value)}

              />



              <textarea

                className="p-3 border rounded"

                placeholder="Chief Complaints"

                value={chiefComplaints}

                onChange={(e) => setChiefComplaints(e.target.value)}

              />



              <textarea

                className="p-3 border rounded"

                placeholder="History"

                value={history}

                onChange={(e) => setHistory(e.target.value)}

              />



              <input

                type="number"

                min={0}

                max={10}

                className="p-3 border rounded"

                placeholder="Pain severity (0-10)"

                value={painSeverity === "" ? "" : painSeverity}

                onChange={(e) => setPainSeverity(e.target.value === "" ? "" : Number(e.target.value))}

              />



              <textarea

                className="p-3 border rounded"

                placeholder="Assessment findings"

                value={assessmentFindings}

                onChange={(e) => setAssessmentFindings(e.target.value)}

              />



              <textarea

                className="p-3 border rounded"

                placeholder="Diagnosis (Clinical / Imaging-based)"

                value={imagingDiagnosis}

                onChange={(e) => setImagingDiagnosis(e.target.value)}

              />



              <input

                className="p-3 border rounded"

                placeholder="Mode of Treatment (Physiotherapy / Medical / Surgical)"

                value={modeOfTreatment}

                onChange={(e) => setModeOfTreatment(e.target.value)}

              />

            </div>

          </section>



          {/* Section 3 - Static Posture (Anterior) */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Static Posture (Anterior View)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input

                className="p-3 border rounded"

                placeholder="Head Tilt (Neutral / Left / Right)"

                value={headTilt}

                onChange={(e) => setHeadTilt(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Shoulder Alignment (Symmetrical / Elevated/Depressed)"

                value={shoulderAlignment}

                onChange={(e) => setShoulderAlignment(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Trunk Alignment"

                value={trunkAlignment}

                onChange={(e) => setTrunkAlignment(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Pelvic Alignment (Level / Tilted)"

                value={pelvicAlignment}

                onChange={(e) => setPelvicAlignment(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Knee Alignment (Normal / Valgus / Varus)"

                value={kneeAlignmentAnterior}

                onChange={(e) => setKneeAlignmentAnterior(e.target.value)}

              />

            </div>

          </section>



          {/* Section 3 - Static Posture (Lateral) */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Static Posture (Lateral View)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input

                className="p-3 border rounded"

                placeholder="Head Alignment (Neutral / Forward / Retracted)"

                value={headAlignmentLat}

                onChange={(e) => setHeadAlignmentLat(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Shoulder Alignment (Aligned / Rounded / Protracted)"

                value={shoulderAlignmentLat}

                onChange={(e) => setShoulderAlignmentLat(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Spinal Curves (Normal / Increased / Decreased)"

                value={spinalCurves}

                onChange={(e) => setSpinalCurves(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Pelvic Tilt (Neutral / Anterior / Posterior)"

                value={pelvicTilt}

                onChange={(e) => setPelvicTilt(e.target.value)}

              />

              <input

                className="p-3 border rounded"

                placeholder="Knee Alignment (Neutral / Hyperextension / Flexed)"

                value={kneeAlignmentLat}

                onChange={(e) => setKneeAlignmentLat(e.target.value)}

              />

            </div>

          </section>



          {/* Section 4 - ROM */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Joint Range of Motion (ROM)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Ankle Dorsiflexion (cm)"

                value={ankleDorsiflexion === "" ? "" : ankleDorsiflexion}

                onChange={(e) => setAnkleDorsiflexion(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Hip Flexion (degrees)"

                value={hipFlexion === "" ? "" : hipFlexion}

                onChange={(e) => setHipFlexion(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Hip Extension (degrees)"

                value={hipExtension === "" ? "" : hipExtension}

                onChange={(e) => setHipExtension(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Popliteal Angle (degrees)"

                value={poplitealAngle === "" ? "" : poplitealAngle}

                onChange={(e) => setPoplitealAngle(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Thomas Test (degrees)"

                value={thomasTest === "" ? "" : thomasTest}

                onChange={(e) => setThomasTest(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Shoulder Flexion (degrees)"

                value={shoulderFlexion === "" ? "" : shoulderFlexion}

                onChange={(e) => setShoulderFlexion(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Apley's Scratch Test - Right (cm)"

                value={apleyRight === "" ? "" : apleyRight}

                onChange={(e) => setApleyRight(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Apley's Scratch Test - Left (cm)"

                value={apleyLeft === "" ? "" : apleyLeft}

                onChange={(e) => setApleyLeft(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Thoracic Rotation (degrees)"

                value={thoracicRotation === "" ? "" : thoracicRotation}

                onChange={(e) => setThoracicRotation(e.target.value === "" ? "" : Number(e.target.value))}

              />

            </div>

          </section>



          {/* Section 5 - Strength & Stability */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Strength & Stability</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <textarea

                className="p-3 border rounded"

                placeholder="Single-Leg Squat (qualitative note)"

                value={singleLegSquatNote}

                onChange={(e) => setSingleLegSquatNote(e.target.value)}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Side Plank - Right (seconds)"

                value={sidePlankRight === "" ? "" : sidePlankRight}

                onChange={(e) => setSidePlankRight(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Side Plank - Left (seconds)"

                value={sidePlankLeft === "" ? "" : sidePlankLeft}

                onChange={(e) => setSidePlankLeft(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Plank (seconds)"

                value={plankHold === "" ? "" : plankHold}

                onChange={(e) => setPlankHold(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Single-Leg Bridge Hold (seconds)"

                value={singleLegBridgeHold === "" ? "" : singleLegBridgeHold}

                onChange={(e) => setSingleLegBridgeHold(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Calf Raise Endurance (reps)"

                value={calfRaiseReps === "" ? "" : calfRaiseReps}

                onChange={(e) => setCalfRaiseReps(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Grip Strength (kgf)"

                value={gripStrength === "" ? "" : gripStrength}

                onChange={(e) => setGripStrength(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                className="p-3 border rounded"

                placeholder="Copenhagen adductor test (seconds)"

                value={copenhagenHold === "" ? "" : copenhagenHold}

                onChange={(e) => setCopenhagenHold(e.target.value === "" ? "" : Number(e.target.value))}

              />

            </div>

          </section>



          {/* Section 6 - FMS */}

          <section>

            <h2 className="text-lg font-semibold mb-3">Functional Movement Screening (FMS)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="Deep Squat (0-3)"

                value={deepSquat === "" ? "" : deepSquat}

                onChange={(e) => setDeepSquat(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="Hurdle Step (0-3)"

                value={hurdleStep === "" ? "" : hurdleStep}

                onChange={(e) => setHurdleStep(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="In-line Lunge (0-3)"

                value={inlineLunge === "" ? "" : inlineLunge}

                onChange={(e) => setInlineLunge(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="Shoulder Mobility (0-3)"

                value={shoulderMobility === "" ? "" : shoulderMobility}

                onChange={(e) => setShoulderMobility(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="Active Straight Leg Raise (0-3)"

                value={activeStraightLegRaise === "" ? "" : activeStraightLegRaise}

                onChange={(e) => setActiveStraightLegRaise(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="Trunk Stability Push-up (0-3)"

                value={trunkStabilityPushup === "" ? "" : trunkStabilityPushup}

                onChange={(e) => setTrunkStabilityPushup(e.target.value === "" ? "" : Number(e.target.value))}

              />

              <input

                type="number"

                min={0}

                max={3}

                className="p-3 border rounded"

                placeholder="Rotary Stability (0-3)"

                value={rotaryStability === "" ? "" : rotaryStability}

                onChange={(e) => setRotaryStability(e.target.value === "" ? "" : Number(e.target.value))}

              />

            </div>

          </section>



          {/* Submit */}

          <div className="flex items-center justify-between">

            <div className="text-sm text-gray-500">All fields are optional except patient name.</div>

            <div className="flex items-center gap-3">

              <button

                type="button"

                onClick={() => {

                  resetForm();

                }}

                className="px-4 py-2 border rounded text-sm"

              >

                Reset

              </button>



              <button

                type="submit"

                disabled={loading}

                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"

              >

                {loading ? "Saving..." : "Save Entry"}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>

  );

}

