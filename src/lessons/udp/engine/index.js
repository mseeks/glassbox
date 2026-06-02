const UDP_MTU_LIMITS = {
  ethernetMtu: 1500,
  ipv6MinimumMtu: 1280,
  ipv4HeaderBytes: 20,
  ipv6HeaderBytes: 40,
  udpHeaderBytes: 8,
  dnsClassicSafePayloadBytes: 512,
  jumboPayloadBytes: 9000,
  maxUdpPayloadBytes: 65507,
};

export function classifyUdpPayloadSize(size, limits = UDP_MTU_LIMITS) {
  const {
    ethernetMtu,
    ipv6MinimumMtu,
    ipv4HeaderBytes,
    ipv6HeaderBytes,
    udpHeaderBytes,
    dnsClassicSafePayloadBytes,
    jumboPayloadBytes,
    maxUdpPayloadBytes,
  } = limits;

  const maxPayloadEthernet = ethernetMtu - ipv4HeaderBytes - udpHeaderBytes;
  const maxIPv6Safe = ipv6MinimumMtu - ipv6HeaderBytes - udpHeaderBytes;
  const fragmentPayloadBytes = ethernetMtu - ipv4HeaderBytes;
  const fragments =
    size > maxPayloadEthernet ? Math.ceil((size + udpHeaderBytes) / fragmentPayloadBytes) : 1;

  let zone;
  if (size <= dnsClassicSafePayloadBytes) {
    zone = 'SAFE';
  } else if (size <= maxIPv6Safe) {
    zone = 'SAFE';
  } else if (size <= maxPayloadEthernet) {
    zone = 'CAUTION';
  } else if (size <= jumboPayloadBytes) {
    zone = 'FRAGMENTS';
  } else if (size <= maxUdpPayloadBytes) {
    zone = 'PATHOLOGICAL';
  } else {
    zone = 'INVALID';
  }

  return {
    zone,
    fragments,
    maxPayloadEthernet,
    maxIPv6Safe,
    fragmentPayloadBytes,
    maxUdpPayloadBytes,
  };
}
