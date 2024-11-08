package backend.utils

import com.netflix.graphql.dgs.DgsScalar
import graphql.language.StringValue
import graphql.schema.Coercing
import graphql.schema.CoercingParseLiteralException

@DgsScalar(name = "JSON")
class JsonScalar : Coercing<Any, Any> {
    override fun serialize(dataFetcherResult: Any): Any {
        return dataFetcherResult
    }

    override fun parseValue(input: Any): Any {
        return input
    }

    override fun parseLiteral(input: Any): Any {
        return when (input) {
            is StringValue -> input.value
            else -> throw CoercingParseLiteralException("Expected type 'StringValue' but was '${input::class.simpleName}'.")
        }
    }

}
