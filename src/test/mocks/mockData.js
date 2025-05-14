/**
 * Mock data for testing blockchain components
 */
export const mockBlockData = {
  blocks: [
    {
      hash: "00000000000000000002bf1c218853bc920f41126f88843b1a89c8f904e31c5d",
      height: 800000,
      time: 1686672076,
      tx_count: 2104,
      size: 1578494,
      miner: "Foundry USA",
      fee: 11370767,
      weight: 3992952,
      ver: 536870912,
      nonce: 3347294379
    },
    {
      hash: "00000000000000000001ea4cc7daf963c7de347a26e69ad97c7df99c6e788d1a",
      height: 799999,
      time: 1686670517,
      tx_count: 3158,
      size: 1630052,
      miner: "AntPool",
      fee: 15680452,
      weight: 3991876,
      ver: 671088640,
      nonce: 3347294379
    }
  ]
};

export const mockBlockDetails = {
  hash: "00000000000000000002bf1c218853bc920f41126f88843b1a89c8f904e31c5d",
  height: 800000,
  time: 1686672076,
  prev_block: "00000000000000000001ea4cc7daf963c7de347a26e69ad97c7df99c6e788d1a",
  mrkl_root: "f8f97560c79163f6257a0dfa51c4172c500c24ad112f37948f723b314d025add",
  tx_count: 2104,
  size: 1578494,
  weight: 3992952,
  bits: 386237684,
  fee: 11370767,
  nonce: 3347294379,
  n_tx: 2104,
  ver: 536870912,
  miner: "Foundry USA",
  tx: [
    {
      hash: "b0c5c624acef329a587b91de4adba9175934f1517827df92fa465d1dc23f9e6a",
      inputs: [
        {
          prev_out: {
            addr: "bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj",
            value: 97825212
          }
        }
      ],
      out: [
        {
          addr: "bc1qhqyyr5kuz05xlkjcqz8m6yswnlv9qgqwur9jw6",
          value: 6250000000
        },
        {
          addr: "bc1qjh0akslml59uuczddqu0y4p3vj64hg6qa8tac2",
          value: 4292641
        }
      ]
    }
  ]
};

export const mockTransactions = [
  {
    hash: "b0c5c624acef329a587b91de4adba9175934f1517827df92fa465d1dc23f9e6a",
    inputs: [
      {
        prev_out: {
          addr: "bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj",
          value: 97825212
        }
      }
    ],
    out: [
      {
        addr: "bc1qhqyyr5kuz05xlkjcqz8m6yswnlv9qgqwur9jw6",
        value: 6250000000
      },
      {
        addr: "bc1qjh0akslml59uuczddqu0y4p3vj64hg6qa8tac2",
        value: 4292641
      }
    ]
  },
  {
    hash: "80e2a9a28928a4b61d951be9b10c771f8d4d87c93fd0c3b3d7bada0a7f947129",
    inputs: [
      {
        prev_out: {
          addr: "bc1q7cyfcrl748nc3hfr8y7jlgp9dafke3qw94304l",
          value: 7212345
        }
      }
    ],
    out: [
      {
        addr: "bc1qr3jmkrd4wh9d3f5l5q6htv3nx5r0c5pfcmsrsm",
        value: 7111345
      }
    ]
  }
];