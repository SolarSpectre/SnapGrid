import Link from "next/link";

export default function HomePage() {
  const mockUrls = [
    "https://utfs.io/f/MLiSC9m1s4rCyInrtd6WBQ87rmVTOFqiUZe0PdpNIK4E5JLM",
"https://utfs.io/f/MLiSC9m1s4rCMQD2Onm1s4rCy3jXGOf2qgT0ZRJnidQwb8KL",
"https://utfs.io/f/MLiSC9m1s4rC9AMxkMHVaU5WkFTNu03CmypLx4cOM1DEzP8K",
"https://utfs.io/f/MLiSC9m1s4rCco46v3ixlmhG8UnHT0zide3kwxgEIsyj1bLO",
  ]
  const mockImages = mockUrls.map((url,index)=>({
    id: index+1,
    url
  }))
  return (
    <main className="">
      <div className="flex flex-wrap gap-4">{
        [...mockImages,...mockImages,...mockImages].map((image)=>(
        <div key={image.id} className="w-48">
          <img src={image.url}/>
        </div>
        ))
      }</div>
    </main>
  );
}
