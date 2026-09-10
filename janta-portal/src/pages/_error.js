/**
 * Custom Pages Router _error. Avoids using Next's default _error that can
 * trigger "Html should not be imported outside of pages/_document" during 404 prerender.
 */
function Error({ statusCode }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>{statusCode ? `Error ${statusCode}` : 'An error occurred'}</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
