import { SelectQueryBuilder } from 'typeorm';

const MAX_LIST_RESULTS = 100;

/**
 * Configuration for the getPageOfQuery util
 */
export interface QueryPageConfiguration<Entity, OrderingField extends keyof Entity> {
    query: SelectQueryBuilder<Entity>;
    orderingField: OrderingField;
    entityAlias: string;
    page: number;
    orderingDirection?: 'ASC' | 'DESC';
    pageSize?: number;
}

/**
 * Gets the result of a SelecQueryBuilder paginated, taking only the result of the pointed
 * page in the params
 * @param {SelectQueryBuilder} config.query query to obtain the page
 * @param {OrderingField} config.orderingField field to order by in the query
 * @param {string} config.entityAlias alias used to rename the entity in the query
 * @param {number} config.page number of page to obtain
 * @param {'ASC' | 'DESC'} config.orderingDirection ordering direction 'ASD' | 'DESC'
 * @param {number} config.pageSize size of the page in the pagination query
 * @returns { currentPage: Entity[]; pagesCount: number }
 */
const getPageOfQuery = async <Entity, OrderingField extends keyof Entity>(
    config: QueryPageConfiguration<Entity, OrderingField>,
): Promise<{ currentPage: Entity[]; pagesCount: number }> => {
    const queryPageSize = config.pageSize ?? MAX_LIST_RESULTS;
    const [currentPage, count] = await config.query
        .take(queryPageSize)
        .skip((config.page - 1) * queryPageSize)
        .orderBy(`${config.entityAlias}.${config.orderingField.toString()}`, config.orderingDirection ?? 'DESC')
        .getManyAndCount();

    if (!count) return { currentPage: [], pagesCount: 0 };

    const pagesCount = Math.ceil(count / queryPageSize);

    if (config.page > pagesCount) return { currentPage: [], pagesCount };

    return { currentPage, pagesCount };
};

export const PaginationUtils = {
    getPageOfQuery,
};