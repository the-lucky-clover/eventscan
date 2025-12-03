// OpenTelemetry Tracing Setup for CALCLiK
// This module sets up distributed tracing for AI operations

import { WebTracerProvider } from 'https://cdn.jsdelivr.net/npm/@opentelemetry/sdk-trace-web@1.18.0/+esm';
import { OTLPTraceExporter } from 'https://cdn.jsdelivr.net/npm/@opentelemetry/exporter-trace-otlp-http@0.45.0/+esm';
import { BatchSpanProcessor } from 'https://cdn.jsdelivr.net/npm/@opentelemetry/sdk-trace-base@1.18.0/+esm';
import { Resource } from 'https://cdn.jsdelivr.net/npm/@opentelemetry/resources@1.18.0/+esm';
import { SemanticResourceAttributes } from 'https://cdn.jsdelivr.net/npm/@opentelemetry/semantic-conventions@1.18.0/+esm';
import { trace, context } from 'https://cdn.jsdelivr.net/npm/@opentelemetry/api@1.7.0/+esm';

let tracer;

export function initializeTracing() {
  try {
    // Create a resource with service information
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'calclik-landing-page',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    });

    // Create OTLP exporter (AI Toolkit endpoint)
    const exporter = new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
      headers: {},
    });

    // Create tracer provider
    const provider = new WebTracerProvider({
      resource: resource,
    });

    // Add batch span processor
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    // Register the provider
    provider.register();

    // Get tracer instance
    tracer = trace.getTracer('calclik-ai-tracer', '1.0.0');

    console.log('✓ OpenTelemetry tracing initialized');
    return tracer;
  } catch (error) {
    console.warn('Tracing initialization failed (optional feature):', error);
    return null;
  }
}

export function getTracer() {
  return tracer;
}

// Helper to create spans for AI operations
export async function traceAIOperation(operationName, attributes, operation) {
  if (!tracer) {
    // If tracing is not available, just run the operation
    return await operation();
  }

  const span = tracer.startSpan(operationName, {
    attributes: {
      'ai.operation.type': operationName,
      ...attributes,
    },
  });

  try {
    const result = await context.with(trace.setSpan(context.active(), span), operation);
    span.setStatus({ code: 1 }); // OK
    return result;
  } catch (error) {
    span.setStatus({ 
      code: 2, // ERROR
      message: error.message 
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}

// Helper for URL scanning operations
export async function traceURLScan(url, operation) {
  return traceAIOperation('url.scan', {
    'url': url,
    'operation': 'fetch_webpage'
  }, operation);
}

// Helper for AI event extraction
export async function traceEventExtraction(textLength, operation) {
  return traceAIOperation('ai.event.extraction', {
    'text.length': textLength,
    'model': 'Xenova/bert-base-NER',
    'operation': 'extract_events'
  }, operation);
}

// Helper for AI model initialization
export async function traceModelInit(modelName, operation) {
  return traceAIOperation('ai.model.initialize', {
    'model.name': modelName,
    'model.type': 'token-classification'
  }, operation);
}
