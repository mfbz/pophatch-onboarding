import { Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

export default function Home() {
  return (
    <Stage>
      <TopBar current="find" done={[]} />
      <main className="flex flex-1 flex-col justify-center gap-3 pt-16">
        <h1 className="font-display text-page-title font-bold text-fg max-tablet:text-page-title-phone">
          One link to start.
        </h1>
        <p className="text-lg">PopHatch finds the rest.</p>
      </main>
    </Stage>
  );
}
