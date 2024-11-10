package backend.files

import backend.graphql.permissions.PermissionDeniedException
import com.netflix.graphql.dgs.exceptions.DefaultDataFetcherExceptionHandler
import com.netflix.graphql.types.errors.TypedGraphQLError
import graphql.GraphQLError
import graphql.execution.DataFetcherExceptionHandler
import graphql.execution.DataFetcherExceptionHandlerParameters
import graphql.execution.DataFetcherExceptionHandlerResult
import org.springframework.stereotype.Component
import java.util.concurrent.CompletableFuture
import org.slf4j.Logger
import org.slf4j.LoggerFactory
@Component
class CustomDataFetchingExceptionHandler : DataFetcherExceptionHandler {

    private val logger: Logger = LoggerFactory.getLogger(CustomDataFetchingExceptionHandler::class.java)
    private val defaultHandler = DefaultDataFetcherExceptionHandler()

    override fun handleException(handlerParameters: DataFetcherExceptionHandlerParameters): CompletableFuture<DataFetcherExceptionHandlerResult> {
        val exception = handlerParameters.exception

        return if (exception is PermissionDeniedException) {
            // Log the exception and stack trace
            logger.error("PermissionDeniedException: ${exception.message}\n\n${exception.stackTraceInfo}", exception)

            // Build the GraphQLError without debugInfo
            val graphqlError: GraphQLError = TypedGraphQLError.newPermissionDeniedBuilder()
                .message(exception.message ?: "Permission denied.")
                .path(handlerParameters.path)
                .build()

            val result = DataFetcherExceptionHandlerResult.newResult()
                .error(graphqlError)
                .build()

            CompletableFuture.completedFuture(result)
        } else {
            // Log other exceptions if needed
//            logger.error("Exception in data fetcher: ${exception.message}", exception)
            // Delegate to the default handler for other exceptions
            defaultHandler.handleException(handlerParameters)
        }
    }
}