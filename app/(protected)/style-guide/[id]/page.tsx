import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getStyleGuide, getDictionaryEntries } from "../actions";
import { StyleGuideEditor } from "./style-guide-editor";

export default async function EditStyleGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:EditStyleGuidePage',message:'Page component entry',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  let guide;
  let dictionary;
  
  try {
    guide = await getStyleGuide(id);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:EditStyleGuidePage',message:'After getStyleGuide',data:{hasGuide:!!guide},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:EditStyleGuidePage',message:'Error in getStyleGuide',data:{errorMessage:error instanceof Error?error.message:String(error),errorName:error instanceof Error?error.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error("Error fetching style guide:", error);
    notFound();
  }

  if (!guide) {
    notFound();
  }

  try {
    dictionary = await getDictionaryEntries(id);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:EditStyleGuidePage',message:'After getDictionaryEntries',data:{hasDictionary:!!dictionary,dictionaryLength:dictionary?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:EditStyleGuidePage',message:'Error in getDictionaryEntries',data:{errorMessage:error instanceof Error?error.message:String(error),errorName:error instanceof Error?error.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error("Error fetching dictionary entries:", error);
    dictionary = []; // Fallback to empty array
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <StyleGuideEditor guide={guide} initialDictionary={dictionary} />
    </div>
  );
}



