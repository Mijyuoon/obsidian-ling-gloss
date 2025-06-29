export const makeDesc = (builder: (desc: DocumentFragment) => void): DocumentFragment => {
    const desc = new DocumentFragment();
    builder(desc);
    return desc;
};