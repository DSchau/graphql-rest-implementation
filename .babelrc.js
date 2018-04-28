module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        module: 'commonjs',
        shippedProposals: true,
        targets: {
          node: '6.10'
        }
      }
    ]
  ]
};
