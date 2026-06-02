import { describe, expect, it } from 'vitest';
import { classifyUdpPayloadSize } from '../src/lessons/udp/engine/index.js';

describe('udp-engine · classifyUdpPayloadSize', () => {
  it.each([
    [512, 'SAFE'],
    [513, 'SAFE'],
    [1232, 'SAFE'],
    [1233, 'CAUTION'],
    [1472, 'CAUTION'],
    [1473, 'FRAGMENTS'],
    [9000, 'FRAGMENTS'],
    [9001, 'PATHOLOGICAL'],
    [65507, 'PATHOLOGICAL'],
    [65508, 'INVALID'],
  ])('classifies %i byte payloads as %s', (size, zone) => {
    expect(classifyUdpPayloadSize(size).zone).toBe(zone);
  });

  it('returns the current Ethernet and IPv6-safe payload thresholds', () => {
    expect(classifyUdpPayloadSize(1200)).toMatchObject({
      maxPayloadEthernet: 1472,
      maxIPv6Safe: 1232,
      maxUdpPayloadBytes: 65507,
    });
  });

  it('does not fragment Ethernet-sized payloads', () => {
    expect(classifyUdpPayloadSize(1472).fragments).toBe(1);
  });

  it('uses the current datagram-plus-header fragment math above the Ethernet ceiling', () => {
    expect(classifyUdpPayloadSize(1473).fragments).toBe(2);
    expect(classifyUdpPayloadSize(65507).fragments).toBe(45);
  });
});
