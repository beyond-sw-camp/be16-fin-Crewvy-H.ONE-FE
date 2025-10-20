const getSvgDataUri = () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#f0f2f5"/><path d="M75,67.5c12.42,0,22.5-10.08,22.5-22.5s-10.08-22.5-22.5-22.5s-22.5,10.08-22.5,22.5S62.58,67.5,75,67.5z M75,75 c-14.99,0-45,7.51-45,22.5v11.25h90V97.5C120,82.51,89.99,75,75,75z" fill="#c0c4cc"/></svg>';
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const defaultAvatarSvg = getSvgDataUri();
