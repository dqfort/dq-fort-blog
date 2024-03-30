import {useEffect, useReducer, useRef} from 'react';
import './App.css';


export default function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  const trainData: {x1: number, x2: number, label: number}[] = [];
  trainData.push({x1: 1, x2: 2, label: 0});
  trainData.push({x1: 10, x2: 11, label: 1});
  trainData.push({x1: 9, x2: 8, label: 1});
  trainData.push({x1: 9, x2: 3, label: 0});

  const createSvgElement = (qualifiedName: string) => document.createElementNS(
    'http://www.w3.org/2000/svg',
    qualifiedName
  );

  const setTransform = (svgElement: SVGElement, x: number, y: number) => svgElement.setAttribute("transform", `translate(${x},${y})`);

  useEffect(() => {
    const plotGroup = createSvgElement("g");
    setTransform(plotGroup, 20, 20);

    const axisBound = createSvgElement("rect");
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

    const plotWidth = 260;
    const axisUnit = 12;
    const axisUnitLength = plotWidth / axisUnit;

    trainData.forEach((item) => {
      const dataPoint = createSvgElement("circle");
      dataPoint.setAttribute("r", "3");
      dataPoint.setAttribute("cx", `${axisUnitLength * item.x1}`);
      dataPoint.setAttribute("cy", `${plotWidth - axisUnitLength * item.x2}`);
      dataPoint.setAttribute("style", `${item.label == 1 ?  "fill: rgb(8, 119, 189);" : "fill: rgb(245, 147, 34);" }`);
      trainGroup.appendChild(dataPoint);
    });

    plotGroup.appendChild(trainGroup);

    const perceptronSplitter = createSvgElement("line");
    perceptronSplitter.setAttribute("stroke", "black");
    perceptronSplitter.setAttribute("x1", `${260/2}`);
    perceptronSplitter.setAttribute("y1", "-10");
    perceptronSplitter.setAttribute("x2", `${260/2}`);
    perceptronSplitter.setAttribute("y2", `${260 + 10}`);

    plotGroup.appendChild(perceptronSplitter);

    const weights = [1, 0, -6];
    // y = x2, x=x1
    // w1*x1+w2*x2+w3*1 = 0;
    // y = (-w1*x -w3*1)/w2
    // y = (-w1*x -w3*1)/w2

    const getperceptronSplitterPoint = (p: number) => {
      const y = (-1 * weights[0] * p + -1 * weights[2]) / weights[1];

      if (Math.abs(y) == Infinity) {
        const x = (-1 * weights[1] * p + -1 * weights[2]) / weights[0];
        return [x, p];
      } 
      // else if (Math.abs(x) == Infinity) {
      //   return [p, y];
      // }

      return [p, y] // or [x, p] ?
    }

    const weightOuput = (x1: number, x2: number) => {
      return weights[0] * x1 + weights[1] * x2 + weights[2];
    }

    const sigmoid = (x: number) => {
      return 1 / (1 + Math.exp(-1 * x));
    }

    const trainPerceptron = () => {

      // console.log([x1, y1]);
      // console.log([x2, y2]);

      let weightUpdates = [0, 0, 0];
      trainData.forEach(item => {
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
  }, [])

  return (
    <div>
      <svg height={300} width={300} ref={svgRef}
        xmlns="http://www.w3.org/2000/svg">
      </svg>
      {/* <button onClick={addFive} className="btn btn-blue">Add 5</button>
      <button onClick={reset} className="btn btn-blue">Reset</button> */}
    </div>
  );
}

