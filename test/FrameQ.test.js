import FrameQ from '../src/FrameQ';

// jest.mock('../src/FrameQ');
describe('add method', () => {
  const fq = new FrameQ();

  test('should return a promise', () => {
    const fn = () => 4;

    const result = typeof fq.add(fn).then;

    expect(result).toBe('function');
  })

  test('should resolve with input function return value', async () => {
    // const fq = new FrameQ();
  
    const fn = () => 3;
  
    const result = await fq.add(fn);
  
    expect(result).toBe(3);
  });

  test('should resolve with input function return promise resolve value', async () => {
    // const fq = new FrameQ();
  
    const fn = () => new Promise((r) => {
      setTimeout(() => { r(5) }, 100);
    });
  
    const result = await fq.add(fn);
  
    expect(result).toBe(5);
  });
})
