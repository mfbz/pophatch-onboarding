import { Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

// Holds the place of step 4 until the connect screen lands, so the flow never ends on a 404.
export default function ConnectPage() {
  return (
    <Stage>
      <TopBar current="connect" done={["find", "confirm"]} />
      <main className="flex flex-1 flex-col pt-20 max-tablet:pt-10">
        <h1 className="font-display text-page-title font-bold text-fg max-tablet:text-page-title-phone">
          Connect your <span className="text-lime">pages.</span>
        </h1>
      </main>
    </Stage>
  );
}
