import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import { useQuery, gql } from '@apollo/client';
import range from 'lodash/fp/range';
import { initializeApollo } from '../lib/apolloClient';
import { LIST_LIMIT } from '../lib/configs';
import ImageRow from '../components/ImageRow';
import PaginationItem from '../components/PaginationItem';

export interface Photo {
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface PhotosData {
  photos: {
    data: Photo[];
    meta: {
      totalCount: number;
    };
  };
}

export interface PhotosVars {
  q: string;
  page: number;
  limit: number;
}

export const GET_PHOTOS_QUERY = gql`
  query Photos($q: String, $page: Int, $limit: Int) {
    photos(
      options: { paginate: { page: $page, limit: $limit }, search: { q: $q } }
    ) {
      data {
        id
        title
        url
        thumbnailUrl
      }
      meta {
        totalCount
      }
    }
  }
`;

const IndexPage = (): JSX.Element => {
  const router = useRouter();
  const push = router.push;
  const q: string =
    router?.query?.q && typeof router.query.q === 'string'
      ? router.query.q
      : '';
  const page: number =
    router?.query?.page && typeof router.query.page === 'string'
      ? parseInt(router.query.page as string, 10)
      : 1;
  const [search, setSearch] = useState<string>(q);
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== q)
        push(`/?q=${search}&page=1`, undefined, { shallow: true });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search, q]); // eslint-disable-line
  const setPage = useCallback(
    (page) => {
      router.push(`/?q=${q}&page=${page}`, undefined, { shallow: true });
    },
    [q, page] // eslint-disable-line
  );
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const { data, error, loading } = useQuery<PhotosData, PhotosVars>(
    GET_PHOTOS_QUERY,
    {
      variables: {
        q: typeof router?.query?.q === 'string' ? router.query.q : '',
        page:
          typeof router?.query?.page === 'string'
            ? parseInt(router?.query?.page, 10)
            : 1,
        limit: LIST_LIMIT,
      },
    }
  );
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
      setPage(1);
    },
    [setSearch, setPage]
  );
  const handleSelectPhoto = useCallback(
    (photo: Photo) => setSelectedPhoto(photo),
    [setSelectedPhoto]
  );
  const handleModalHide = useCallback(() => setSelectedPhoto(null), [
    setSelectedPhoto,
  ]);
  const handleFirstClick = useCallback(() => setPage(1), [setPage]);
  const lastPage: number = data?.photos?.meta?.totalCount
    ? Math.ceil(data?.photos?.meta?.totalCount / LIST_LIMIT)
    : 0;
  const handleLastClick = useCallback(() => setPage(lastPage), [
    setPage,
    lastPage,
  ]);
  const handlePrevClick = useCallback(() => setPage(page - 1), [setPage, page]);
  const handleNextClick = useCallback(() => setPage(page + 1), [setPage, page]);

  if (error) return <p>Error</p>;

  return (
    <div>
      <Container className="mt-5">
        <Form as={Row}>
          <Form.Group controlId="search" as={Col}>
            <Form.Control
              type="text"
              placeholder="Search keywords on title"
              value={search}
              onChange={handleSearchChange}
            />
          </Form.Group>
        </Form>
        <Table striped bordered hover as={Row}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Thumbnail</th>
            </tr>
          </thead>
          <tbody>
            {data?.photos?.data &&
              data.photos.data.map((photo) => (
                <ImageRow
                  key={photo.id}
                  photo={photo}
                  onSelect={handleSelectPhoto}
                />
              ))}
          </tbody>
        </Table>
        {loading && (
          <Row>
            <Col>
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </Col>
          </Row>
        )}
        <Row>
          <Col className="clearfix">
            {data?.photos?.meta?.totalCount ? (
              <Pagination className="float-right">
                <Pagination.First
                  onClick={handleFirstClick}
                  disabled={page === 1}
                />
                <Pagination.Prev
                  onClick={handlePrevClick}
                  disabled={page === 1}
                />
                {range(
                  Math.max(1, page - 2),
                  Math.min(lastPage + 1, page + 3)
                ).map((p) => (
                  <PaginationItem
                    key={p}
                    page={p}
                    active={p === page}
                    onSelect={setPage}
                  />
                ))}
                <Pagination.Next
                  onClick={handleNextClick}
                  disabled={page === lastPage}
                />
                <Pagination.Last
                  onClick={handleLastClick}
                  disabled={page === lastPage}
                />
              </Pagination>
            ) : null}
          </Col>
        </Row>
      </Container>
      <Modal show={!!selectedPhoto} onHide={handleModalHide} animation={false}>
        <Modal.Header closeButton />
        <Modal.Body>
          <Image src={selectedPhoto?.url} className="w-100" />
        </Modal.Body>
      </Modal>
    </div>
  );
};

// eslint-disable-next-line
export async function getServerSideProps(context: any) {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: GET_PHOTOS_QUERY,
    variables: {
      q:
        context.query.q && typeof context.query.q === 'string'
          ? context.query.q
          : '',
      page:
        context.query.page && typeof context.query.page === 'string'
          ? parseInt(context.query.page, 10)
          : 1,
      limit: LIST_LIMIT,
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}

export default IndexPage;
