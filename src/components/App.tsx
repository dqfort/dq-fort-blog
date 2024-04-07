import {useEffect, useRef, useState} from 'react';
import './App.css';


export default function App() {
  const [mode, setMode] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const plotClickHandlerRef = useRef<((event: MouseEvent) => void) | null>(null);
  const isDeletable = useRef(false);

  const trainData = useRef<{x1: number, x2: number, label: number}[]>([]);

  const createSvgElement = (qualifiedName: string) => document.createElementNS(
    'http://www.w3.org/2000/svg',
    qualifiedName
  );

  const setTransform = (svgElement: SVGElement, x: number, y: number) => svgElement.setAttribute("transform", `translate(${x},${y})`);

  const plotWidth = 260;
  const axisUnit = 12;
  const axisUnitLength = plotWidth / axisUnit;

  const addDataPoint = (trainGroup: SVGElement, item: {x1: number, x2: number, label: number}) => {
    const dataPoint = createSvgElement("circle");
    dataPoint.setAttribute("r", "3");
    dataPoint.setAttribute("data-x", `${item.x1}`);
    dataPoint.setAttribute("data-y", `${item.x2}`);
    dataPoint.setAttribute("cx", `${axisUnitLength * item.x1}`);
    dataPoint.setAttribute("cy", `${plotWidth - axisUnitLength * item.x2}`);
    dataPoint.setAttribute("style", `${item.label == 1 ?  "fill: rgb(8, 119, 189);" : "fill: rgb(245, 147, 34);" }`);

    dataPoint.addEventListener(
      "click", (event) => {
        if (isDeletable.current) {
          const node = event.target as SVGAElement;

          const x = Number(node.dataset.x);
          const y = Number(node.dataset.y);
  
          for (let index = 0; index < trainData.current.length; index++) {
            const item = trainData.current[index];
            if (item.x1 == x && item.x2 == y) {
              trainData.current.splice(index, 1);
            }
          }

          node.parentElement?.removeChild(node);
        }
      });

    trainGroup.appendChild(dataPoint);
  }

  useEffect(() => {
    trainData.current.push({x1: 1, x2: 2, label: 0});
    trainData.current.push({x1: 10, x2: 11, label: 1});
    trainData.current.push({x1: 9, x2: 8, label: 1});
    trainData.current.push({x1: 9, x2: 3, label: 0});

    const plotGroup = createSvgElement("g");
    setTransform(plotGroup, 20, 20);

    const axisBound = createSvgElement("rect");
    axisBound.setAttribute("id", "axisBound");
    axisBound.setAttribute("width", "260");
    axisBound.setAttribute("height", "260");
    axisBound.setAttribute("stroke", "#777");
    axisBound.setAttribute("fill", "transparent");

    plotGroup.appendChild(axisBound);

    const xAxis = createSvgElement("g");
    xAxis.classList.add("axis");
    setTransform(xAxis, 0, 260);

    for (let index = 0; index <= 12; index++) {
      const unit = createSvgElement("g");
      unit.classList.add("tick");
      setTransform(unit, 260 * index / 12, 0);
      const line = createSvgElement("line");
      line.setAttribute("y2", "6");
      line.setAttribute("x2", "0");

      const text = createSvgElement("text");
      text.setAttribute("dy", ".71em");
      text.setAttribute("y", "9");
      text.setAttribute("x", "0");
      text.setAttribute("style", "text-anchor: middle;");
      text.textContent = `${index}`; 

      unit.appendChild(line);
      unit.appendChild(text);
      xAxis.appendChild(unit);
    }

    plotGroup.appendChild(xAxis);

    const yAxis = createSvgElement("g");
    yAxis.classList.add("axis");
    setTransform(yAxis, 260, 0);

    for (let index = 0; index <= 12; index++) {
      const unit = createSvgElement("g");
      unit.classList.add("tick");
      setTransform(unit, 0, 260 * (1 - index / 12));
      const line = createSvgElement("line");
      line.setAttribute("y2", "0");
      line.setAttribute("x2", "6");

      const text = createSvgElement("text");
      text.setAttribute("dy", ".32em");
      text.setAttribute("y", "0");
      text.setAttribute("x", "9");
      text.setAttribute("style", "text-anchor: start;");
      text.textContent = `${index}`; 

      unit.appendChild(line);
      unit.appendChild(text);
      yAxis.appendChild(unit);
    }
    plotGroup.appendChild(yAxis);

    svgRef.current?.appendChild(plotGroup);

    const trainGroup = createSvgElement("g");
    trainGroup.setAttribute("id", "trainGroup");

    trainData.current.forEach((item) => {
      addDataPoint(trainGroup, item);
    });

    plotGroup.appendChild(trainGroup);

    const perceptronSplitter = createSvgElement("line");
    perceptronSplitter.setAttribute("stroke", "black");

    plotGroup.appendChild(perceptronSplitter);

    const weights = [1, 0, -6];
    // y = x2, x=x1
    // w1*x1+w2*x2+w3*1 = 0;
    // y = (-w1*x -w3*1)/w2
    // y = (-w1*x -w3*1)/w2

    const getperceptronSplitterPoint = (pX: number) => {
      const pY = (-1 * weights[0] * pX + -1 * weights[2]) / weights[1];
      const getX = (y: number) => (-1 * weights[1] * y + -1 * weights[2]) / weights[0];

      if (Math.abs(pY) == Infinity) {
        const x = (-1 * weights[1] * pX + -1 * weights[2]) / weights[0];
        return [x, pX];
      } 

      if (pY >= 12) {
        const x = getX(12);
        return [x, 12];
      }

      if (pY <= 0) {
        const x = getX(0);
        return [x, 0];
      }

      return [pX, pY];
    }

    const weightOuput = (x1: number, x2: number) => {
      return weights[0] * x1 + weights[1] * x2 + weights[2];
    }

    const sigmoid = (x: number) => {
      return 1 / (1 + Math.exp(-1 * x));
    }

    const trainPerceptron = () => {
      let weightUpdates = [0, 0, 0];
      trainData.current.forEach(item => {
        const yHat = sigmoid(weightOuput(item.x1, item.x2));
        weightUpdates[0] += (item.label - yHat) * item.x1;
        weightUpdates[1] += (item.label - yHat) * item.x2;
        weightUpdates[2] += (item.label - yHat);
      });

      const learningRate = 0.01;
      weights[0] += learningRate * weightUpdates[0]
      weights[1] += learningRate * weightUpdates[1]
      weights[2] += learningRate * weightUpdates[2]

      // console.log(weights);
      const [x1, y1] = getperceptronSplitterPoint(0);
      const [x2, y2] = getperceptronSplitterPoint(12);

      perceptronSplitter.setAttribute("x1", `${axisUnitLength*x1}`);
      perceptronSplitter.setAttribute("y1", `${plotWidth - axisUnitLength*y1}`);
      perceptronSplitter.setAttribute("x2", `${axisUnitLength*x2}`);
      perceptronSplitter.setAttribute("y2", `${plotWidth - axisUnitLength*y2}`);  
    }

    let animationFrameId = 0;
    
    //Our draw came here
    const render = () => {
        trainPerceptron();
        animationFrameId = window.requestAnimationFrame(render);
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, []);

  useEffect(() => {
    if (mode == 'Remove') {
      const axisBound = svgRef.current?.getElementById("axisBound") as SVGElement;
      if (plotClickHandlerRef.current) {
        axisBound.removeEventListener("click", plotClickHandlerRef.current);
      }

      isDeletable.current = true;
    }
    else if (mode == "AddTrue" || mode == "AddFalse") {
      isDeletable.current = false;

      const axisBound = svgRef.current?.getElementById("axisBound") as SVGElement;
      const trainGroup = svgRef.current?.getElementById("trainGroup") as SVGElement;
      if (! (axisBound && trainGroup)) return;

      if (plotClickHandlerRef.current) {
        axisBound.removeEventListener("click", plotClickHandlerRef.current);
      }

      plotClickHandlerRef.current = (event: MouseEvent):void => {
        const plotX = event.offsetX - 20;
        const plotY = event.offsetY - 20
        const x = plotX / axisUnitLength;
        const y = (plotWidth - plotY) / axisUnitLength;
        const label = mode == "AddTrue" ? 1 : 0;
        const item = {x1: x, x2: y, label: label};
        trainData.current.push(item);
        addDataPoint(trainGroup, item);
      };
  
      axisBound.addEventListener('click', plotClickHandlerRef.current);
    }
  }, [mode]);

  return (
    <div>
      <svg height={300} width={300} ref={svgRef}
        xmlns="http://www.w3.org/2000/svg">
      </svg>

      <div className="inline-flex">
        <button onClick={() => { setMode("AddTrue"); }} className={`${ mode == "AddTrue" ? "bg-gray-400" : "bg-gray-300" } hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l`}>
          + True
        </button>
        <button onClick={() => { setMode("AddFalse"); }} className={`${ mode == "AddFalse" ? "bg-gray-400" : "bg-gray-300" } bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4`}>
          + False
        </button>
        <button onClick={() => { setMode("Remove"); }} className={`${ mode == "Remove" ? "bg-gray-400" : "bg-gray-300" } bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r`}>
          - Remove
        </button>
      </div>
      {/* <button onClick={reset} className="btn btn-blue">Reset</button> */}
    </div>
  );
}

