---
title: Beginning of deep learning
author: Eric Cheung
pubDatetime: 2024-03-25T03:46:10Z
slug: beginning-of-deep-learning
featured: false
draft: false
tags:
  - Deep learing
description:
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
  incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel
  fringilla est
---

AI has been impacting our life nowadays, from image classification to ChatGPT, the evolution is very fast! Most of the AI models are implemented by using deep learning technique, which is using a huge amount of data to train the model to get better results for prediction.

Large deep learning model is very complex, but small model is relatively understandable and can do a lot of things, like image classification, sales forecasting, recommendation etc.

## Perceptron

The basic idea of deep learning is consisted by perceptrons, which calculate from the input data to a perceptron output. For instance, an output 0.3 is a probability of an image of a cat.

Even a single can do perceptron. To simpify, we can create a perceptron with 2 inputs and 1 output, and it can form an equation as $f(x) = w_1x_1 + w_2x_2 + b.$

![A perceptron with 2 inputs.](./perceptron_2-inputs.svg)

Where $x_1, x_2$ are the input data, and $w_1, w_2, b$ are the weights and bias can be updated by training to output a more accurate value by the equation. The bias can be also written in $w_3 * 1$.

How can it be used to predict? Let's say there are a group of data with kilograms and heights for either cats or mouses, it can be plotted a graph like:

We can draw a line to split the data to separate to the two groups, which is a task can be performed by the perceptron: if $f(x) >= 0$ then it is a cat, else it is a mouse.

## Training

Continue to the model, we can define $\hat{y} = 1$ if $f(x) >= 0$ else $\hat{y} = 0$, to mean it is a cat if $\hat{y} = 1$ or it is not a cat if $\hat{y} = 0$ (in our case it is a mouse). But how do we get the weight values for the perceptron to form the equation to split the data? We could assume that when a output from $f(x)$ getting bigger, it is more like a cat. We can use that to evolute the model. But there is a problem when some outputs are large and some outputs are small. We need to need a function for normalizing, one commonly used is sigmoid function:
$$
    \sigma(x) = \frac{1} {1 + e^{-x}}
$$

It also can present probability. Now we can use sigmoid to apply to the perception to ouput a probability of beginning a cat as:
$$
    P(C) = \hat{y} = \sigma(f(x))
$$

For the probability for the model correction prediction: 
$$
    P = \prod_{i=0}y_i*\sigma(\hat{y}_i)+(1-y_i)*(1-\sigma(\hat{y}_i))
$$

But there is a problem if there are a lot of predicted outputs, the $p$ will become very small. To solve it, we can take $\log$ to $p$ so that
$$
    \log(p) = \sum_{i=0}y_i*\log(\sigma(\hat{y}_i)) + (1-y_i)*\log(1-\sigma(\hat{y}_i))
$$
