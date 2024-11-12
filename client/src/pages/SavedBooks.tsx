import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { DELETE_BOOK } from '../graphql/mutations';
import Auth from '../utils/auth';

// Define the SavedBook type
interface SavedBook {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image?: string;
}
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Fetch user data using Apollo Client's useQuery hook
  const { loading, error, data } = useQuery(GET_ME, {
    skip: !Auth.loggedIn(), // Skip query if user is not logged in
  });

  // Mutation to delete a book
  const [deleteBook] = useMutation(DELETE_BOOK, {
    // After deletion, refetch user data to update savedBooks
    refetchQueries: [{ query: GET_ME }],
  });

  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    try {
      // Execute deleteBook mutation
      await deleteBook({ variables: { bookId } });
      // Remove book ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // Loading and error states for the query
  if (loading) return <h2>LOADING...</h2>;
  if (error) return <h2>Error fetching data: {error.message}</h2>;

  // Extract user data from query results
  const userData = data?.me || { savedBooks: [] };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
            {userData.savedBooks.map((book: SavedBook) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
              {book.image ? (
                <Card.Img
                src={book.image}
                alt={`The cover for ${book.title}`}
                variant="top"
                />
              ) : null}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">Authors: {book.authors.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button
                className="btn-block btn-danger"
                onClick={() => handleDeleteBook(book.bookId)}
                >
                Delete this Book!
                </Button>
              </Card.Body>
              </Card>
            </Col>
            ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
