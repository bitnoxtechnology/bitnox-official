import { WindowFrame } from "@/components/graphics/window-frame";
import { ROOM_LAYOUTS } from "@/content/event-space";

/**
 * The four layouts, drawn as plans.
 *
 * The one thing the photographs on this page cannot show. A picture of the room shows the
 * room as it was on the day it was photographed; somebody deciding whether their board
 * meeting or their eight-week course fits needs to see the same floor arranged four ways, and
 * a plan is how a venue has always answered that.
 *
 * Furniture is drawn as blocks rather than as individual seats, and that is deliberate rather
 * than a simplification. Sixty countable dots in the theatre plan would be a seat count for
 * every other layout too, and what a classroom or a boardroom setup holds depends on the
 * tables in the room on the day. The plan shows the arrangement; the enquiry gives the
 * number.
 *
 * The screen is at the top of every plan, so the four read as the same room turned around
 * rather than four different rooms.
 *
 * Names come from the same array the table beside this graphic reads, so a renamed layout
 * cannot appear one way in the plan and another way in the copy.
 */

/** The plan bodies, keyed by the layout name in `src/content/event-space.ts`. */
const PLANS: Record<string, React.ReactNode> = {
  Theatre: (
    <>
      {[18, 29, 40, 51].map((y) => (
        <g key={y}>
          <Seating x={13} y={y} width={21} />
          <Seating x={39} y={y} width={21} />
          <Seating x={65} y={y} width={21} />
        </g>
      ))}
    </>
  ),
  Classroom: (
    <>
      {[20, 34, 48].map((y) => (
        <g key={y}>
          <Table x={16} y={y} width={30} height={8} />
          <Table x={53} y={y} width={30} height={8} />
        </g>
      ))}
    </>
  ),
  Boardroom: (
    <>
      <Table x={26} y={22} width={47} height={26} />
      {[30, 41].map((y) => (
        <g key={y}>
          <Seating x={17} y={y} width={6} />
          <Seating x={76} y={y} width={6} />
        </g>
      ))}
      {[34, 46, 58].map((x) => (
        <g key={x}>
          <Seating x={x} y={15} width={9} />
          <Seating x={x} y={52} width={9} />
        </g>
      ))}
    </>
  ),
  "U-shape": (
    <>
      <Table x={19} y={18} width={9} height={38} />
      <Table x={71} y={18} width={9} height={38} />
      <Table x={19} y={48} width={61} height={8} />
      <Seating x={44} y={11} width={11} />
    </>
  ),
};

export function RoomPlans() {
  return (
    <WindowFrame title="Event Space layouts" meta="Plan view, screen at the top">
      <ul className="divide-border grid grid-cols-2 divide-x @2xl:grid-cols-4">
        {ROOM_LAYOUTS.map((layout) => (
          <li
            key={layout.name}
            className="border-border px-4 py-5 [&:nth-child(-n+2)]:border-b @2xl:[&:nth-child(-n+2)]:border-b-0"
          >
            <svg
              viewBox="0 0 100 70"
              className="text-primary w-full"
              role="presentation"
              focusable="false"
            >
              {/* The room, and the screen on its front wall. */}
              <rect
                x={4}
                y={4}
                width={92}
                height={62}
                rx={2}
                className="fill-transparent stroke-current opacity-25"
                strokeWidth={1}
              />
              <line
                x1={36}
                y1={7}
                x2={64}
                y2={7}
                className="stroke-current"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {PLANS[layout.name]}
            </svg>

            <p className="text-foreground mt-3 text-xs font-medium">{layout.name}</p>
          </li>
        ))}
      </ul>
    </WindowFrame>
  );
}

/** A run of chairs with no table in front of it. */
function Seating({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={5}
      rx={1}
      className="fill-current opacity-45"
      strokeWidth={0}
    />
  );
}

/** A table, drawn hollow so it reads as furniture rather than as more seating. */
function Table({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={1}
      className="fill-current stroke-current opacity-70 [fill-opacity:0.12]"
      strokeWidth={1}
    />
  );
}
